<template>
  <van-dialog
    v-model:show="show"
    :style="{ width: '401px', height: '368px' }"
    :showConfirmButton="false"
    :close-on-click-overlay="true"
    class="sign-modal"
    :teleport="teleport"
  >
    <div class="wacom-wrap">
      <div class="mobile-header-wrap" style="color: #333 !important">
        <div class="mobile-header-title gct-text-overflow ml4px mr4px">
          {{ t('sys.pageDesigner.getSignature') }}
        </div>
        <i @click="onClose"><van-icon name="cross" /></i>
      </div>
      <div class="mobile-render-content ks-column px-16px pt12px">
        <van-form
          ref="formRef"
          :submit-on-enter="false"
          :required="true"
          validate-trigger="onSubmit"
        >
          <van-cell-group inset :style="{ '--van-cell-group-inset-padding': 0 }">
            <van-field
              v-model="formState.username"
              :label="t('sys.userName')"
              name="username"
              :placeholder="t('sys.inputText')"
              label-align="top"
              :rules="[
                { required: true, message: t('sys.pleaseInputSth', { sth: t('sys.userName') }) },
              ]"
              clearable
              :border="true"
            />
            <van-field
              v-no-copy-paste
              v-model="formState.password"
              :type="showPassword ? 'text' : 'password'"
              :label="t(`sys.platform.signWay.${getSignWay()}`)"
              name="password"
              :placeholder="t('sys.inputText')"
              label-align="top"
              :rules="[
                {
                  required: true,
                  message: t('sys.pleaseInputSth', {
                    sth: t(`sys.platform.signWay.${getSignWay()}`),
                  }),
                },
              ]"
              :border="true"
            >
              <template #right-icon>
                <i
                  v-if="showPassword"
                  class="iconfont icon-chakan1"
                  @click="togglePasswordVisibility"
                ></i>
                <i v-else class="iconfont icon-a-baomi1" @click="togglePasswordVisibility"></i>
              </template>
            </van-field>
          </van-cell-group>
        </van-form>
      </div>
      <div class="btn-wrap">
        <van-button plain @click="onReset">{{ t('sys.reset') }}</van-button>
        <van-button type="primary" @click="onConfirm">{{ t('sys.okText') }}</van-button>
      </div>
    </div>
  </van-dialog>
</template>
<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useI18n } from '@mobile/utils/useI18n';
  import { postSignatureGetSignatureUploadOrWriteImage } from '/@/apis/gct-apaas/SignatureController';
  import CryptoJS from 'crypto-js';
  import { showToast } from 'vant';
  import { postSignHistory } from '/@/apis/gct-apaas/SignHistoryController';
  import { getPlatInfo } from '/@/apis/gct-platform/PlatformConfigController';
  import { PlatformSettingEnum } from '@mobile/type';
  import { UserData } from '@mobile/stores/loginHooks';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';

  const props = defineProps({
    value: {
      type: Boolean,
      default: false,
    },
  });
  const { teleport } = usePadTeleport();

  const enableSignPassword = ref(0);
  const isParentOverlayEnabled = inject('isParentOverlayEnabled');
  const getSecurityConfig = async () => {
    const config = await getPlatInfo({ configEnum: PlatformSettingEnum.SECURITY });
    if (config && config.value) {
      enableSignPassword.value = JSON.parse(config.value).enableSignPassword || 0;
    }
  };

  getSecurityConfig();

  const getSignWay = () => {
    switch (enableSignPassword.value) {
      case 0:
        return 'LOGIN';
      case 1:
        return 'SIGN';
      case 2:
        return 'DOMAIN';
      default:
        return 'LOGIN';
    }
  };

  const emit = defineEmits(['update:value', 'on-confirm']);
  const { t } = useI18n();
  const formRef = ref();
  const formState = ref({ password: '', username: '' });
  const showPassword = ref(false);

  const passwordIcon = computed(() => {
    return showPassword.value ? 'eye-o' : 'closed-eye';
  });

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };
  watch(
    () => props.value,
    (val) => {
      isParentOverlayEnabled && isParentOverlayEnabled(!val);
    },
    {
      immediate: true,
    },
  );
  const show = computed({
    get: () => {
      return props.value;
    },
    set: (val) => {
      emit('update:value', val);
    },
  });

  const onClose = () => {
    onReset();
    emit('update:value', false);
  };

  const onReset = async () => {
    await formRef.value?.resetValidation();
    formState.value = { password: '', username: '' };
  };

  function sha256(password, key) {
    const hash = CryptoJS.SHA256(password);
    return hash.toString(CryptoJS.enc.Hex);
  }

  const onConfirm = async () => {
    const key = Math.random().toString(16).substr(2, 8);
    await formRef.value?.validate();
    const type =
      enableSignPassword.value == 1 ? 'SIGN' : enableSignPassword.value == 2 ? 'DOMAIN' : 'LOGIN';
    const { signatureImage, username, currentTime, signHistoryId } =
      await postSignatureGetSignatureUploadOrWriteImage({
        ...formState.value,
        password:
          enableSignPassword.value == 2
            ? formState.value.password
            : sha256(formState.value.password, key),
        type,
      });
    onClose();
    const res = {
      url: signatureImage,
      historyId: signHistoryId,
      time: currentTime,
      enableSignPassword: enableSignPassword.value,
      username,
      signatureName: UserData.value?.fullname,
    };
    emit('on-confirm', res);
  };
  /**
   * 添加签名记录并返回id
   * @export
   * @param opts
   * @return {*}
   */
  async function addSignHistory(opts: { url: string }): Promise<string> {
    const id = await postSignHistory(opts);
    return id!;
  }
</script>
<style lang="less" scoped>
  .wacom-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #fff;

    .mobile-header-wrap {
      display: flex;
      box-sizing: border-box;
      height: 52px;
      padding: 0 18px;
      background-color: #fff;
      font-size: 16px;
      line-height: 52px;

      .mobile-header-title {
        flex: 1;
        font-weight: 700;
        text-align: center;
      }
    }

    .mobile-render-content {
      position: relative;
      // padding: 14px 12px;
      box-sizing: border-box;
      flex: 1;
      padding: 12px 24px;
      overflow: auto;
    }
  }

  .btn-wrap {
    display: flex;
    padding: 16px;
    column-gap: 16px;

    :deep(.van-button) {
      flex: 1;

      &.van-button--primary {
        flex: 2;
      }
    }
  }

  :deep(.van-cell) {
    padding: 12px 0;

    &::after {
      border: 0;
    }

    .van-cell__value {
      .van-field__body {
        padding: 3px 12px;
        border: 1px solid #e8ebf0;
        border-radius: 4px;
      }
    }
  }
</style>
<style>
  .sign-modal .van-dialog__content {
    height: 100%;
  }
</style>
