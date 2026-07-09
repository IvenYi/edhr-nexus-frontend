<template>
  <Popup
    :close-on-click-overlay="false"
    v-model:show="visible"
    position="right"
    teleport="body"
    :style="{
      height: '100%',
      width: '30%',
      paddingBottom: '5px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }"
  >
    <div class="popupheaher ks-row-middle">
      <div class="ks-col px16px text-[#212528] font-bold">{{ title }}</div>
      <div class="w30px text-left text-[#C3C3C3]" @click.stop="cancelFunc">
        <van-icon name="cross" />
      </div>
    </div>
    <div class="signature-container ks-col overflow-hidden ks-column">
      <div class="ks-col overflow-y-auto p16px">
        <van-form class="signature-form" ref="formRef">
          <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="用户名"
            :disabled="validatePass"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="密码"
            :disabled="validatePass"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
          <div class="form-actions">
            <van-button
              plain
              type="primary"
              size="small"
              :loading="validateLoading"
              :disabled="validatePass"
              @click="confirmSignature"
            >
              签名认证
            </van-button>
          </div>
        </van-form>
      </div>
      <!-- 底部安全区 -->
      <div class="popup-bottom ks-row-middle pl-16px pr-16px">
        <div class="ks-col ks-col-4">
          <van-button @click="close">取消</van-button>
        </div>
        <div class="ks-col ks-col-4 text-center">
          <van-button type="primary" :loading="confirmLoading" @click="fullValidate">
            确认
          </van-button>
        </div>
      </div>
    </div>
  </Popup>
</template>
<script lang="ts" setup name="gct-signature-confirm-render">
  import { Popup, showToast } from 'vant';
  import { computed, ref } from 'vue';
  import { debounce } from 'lodash-es';
  import CryptoJS from 'crypto-js';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  interface IProps {
    title: string;
    userId?: string;
    cancel?: any;
    destroyVm?: any;
    successCallback?: any;
    failCallback?: any;
  }
  function sha256(password) {
    const hash = CryptoJS.SHA256(password);
    return hash.toString(CryptoJS.enc.Hex);
  }
  const randomUUID = (uuids: string[] = [], opts?: any): string => {
    const {
      needPrefix = false,
      isString = true,
      prefix = 'u_',
      length = 8,
      chars = '',
      numPref = false,
    } = opts || {};
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // 大写字母和数字
    if (chars === 'capital&number') {
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    } else if (chars === 'lowercase&number') {
      // 小写字母和数字
      characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    } else if (chars === 'lowercase') {
      // 小写字母
      characters = 'abcdefghijklmnopqrstuvwxyz';
    }
    let uuid;
    while (!uuid) {
      let id = '';
      if (isString) {
        if (numPref) {
          id += Math.floor(Math.random() * 9) + 1;
        }
        for (let i = 0; i < length; i++) {
          id += characters.charAt(Math.floor(Math.random() * characters.length));
        }
      } else {
        id = `${needPrefix ? prefix : ''}${
          numPref ? Math.floor(Math.random() * 9) + 1 : ''
        }${Math.random().toString(36).substr(2, length)}`;
      }
      if (!uuids.includes(id)) {
        uuid = id;
      }
    }
    return uuid;
  };

  const relationId = ref(randomUUID([], { length: 16 }));

  const signRelationId = computed({
    get() {
      return relationId.value;
    },
    set(val) {
      relationId.value = val;
    },
  });

  const formRef = ref();

  const username = ref('');
  const password = ref('');
  const validateLoading = ref(false);
  const validatePass = ref(false);

  const visible = ref(false);
  const confirmLoading = ref(false);

  const props = defineProps<IProps>();
  async function cancelFunc() {
    props.cancel && props.cancel();
    await close();
  }

  async function open() {
    console.log(props.successCallback, 'props.successCallback');
    visible.value = true;
  }
  async function close() {
    visible.value = false;
    props.destroyVm && (await props.destroyVm());
  }

  const confirmSignature = debounce(async () => {
    console.log('confirmSignature', username.value, password.value);
    if (validatePass.value) return;
    await formRef.value?.validate();
    validateLoading.value = true;
    const signParams = {
      sign_account_: username.value,
      relation_id_: signRelationId.value,
      type_: 'deviceOverhaul',
    };
    try {
      Object.assign(signParams, {
        password_: sha256(password.value),
      });
      const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_sign_history',
          bsKey: 'accountSave',
        },
        {
          ...signParams,
        },
      );
      if (props?.userId && res && props.userId !== res) {
        showToast('签名账号与选择账号不一致！');
        return;
      }
      validatePass.value = true;
    } catch (err) {
      validatePass.value = false;
    } finally {
      validateLoading.value = false;
    }
  }, 200);

  const fullValidate = async () => {
    try {
      await formRef.value?.validate();
      if (!validatePass.value) {
        formRef.value?.clearValidate();
        showToast('请先签名确认');
        return;
      }
      confirmLoading.value = true;
      props.successCallback && (await props.successCallback());
      close();
    } catch (err) {
      console.error(err, 'error');
      props.failCallback && (await props.failCallback());
      throw err;
    } finally {
      confirmLoading.value = false;
    }
  };

  defineExpose({ open, close });
</script>

<style scoped lang="less">
  :deep(.van-cell) {
    padding: 10px;
    background-color: transparent;
  }

  .popupheaher {
    width: 100%;
    border-bottom: 1px solid var(--van-cell-border-color);
    font-size: 16px;
    font-weight: bold;
    line-height: 50px;
  }

  .sign-group {
    border: 1px solid #eee;
    border-radius: 6px;
  }

  .sign-info-top {
    display: flex;
    padding: 8px;
    column-gap: 8px;
    border-radius: 6px;
    background-color: var(--van-primary-color-1);

    &-item {
      flex: 1;
      font-size: 12px;
      text-align: center;

      &-title {
        margin-bottom: 4px;
        color: var(--van-primary-color);
      }
    }
  }

  :deep(.van-cell__right-icon) {
    line-height: 24px;
  }
  .signature-container {
    .signature-form {
      background: #ffffff;
      box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.05);
      border-radius: 8px 8px 8px 8px;
      padding: 16px;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    padding: 16px 16px 0;
  }
  .form-actions :deep(.van-button) {
    width: auto !important;
  }

  .popup-bottom {
    height: 56px;
    border-top: 1px solid #e0e3eb;
    padding: 8px 16px;
    .ks-col {
      &-4 {
        padding: 0 4px;
      }
    }
    .van-button {
      width: 100%;
      height: 40px;
      font-size: 14px;
      border-radius: 4px;
    }
  }
</style>
