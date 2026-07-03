<template>
  <div :class="['sign-switcher', 'ant-form-horizontal']">
    <van-field
      :label="t('sys.pageDesigner.signatureType')"
      :required="required"
      v-if="!hiddenSignMode"
    >
      <template #input>
        <van-radio-group v-model="actualSignMode" direction="horizontal">
          <van-radio
            v-if="!fixSignMode || signMode === SignMode.HANDWRITING"
            :name="SignMode.HANDWRITING"
          >
            {{ t('sys.pageDesigner.handwrittenSignature') }}
          </van-radio>
          <van-radio
            v-if="!fixSignMode || signMode === SignMode.PASSWORD"
            :name="SignMode.PASSWORD"
          >
            {{ t('sys.platform.ACCOUNT') }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <PasswordSigner
      :class="'signer'"
      v-if="actualSignMode === SignMode.PASSWORD"
      ref="signerRef"
      :get-sign-img-by-account="getSignImgByAccount"
      :disable-user-name="disableUserName"
    />
    <handwritingSigner
      :class="'signer'"
      v-else-if="actualSignMode === SignMode.HANDWRITING"
      ref="signerRef"
      :upload-sign-file="uploadSignFile"
    />
    <div v-else>{{ `不支持的类型${actualSignMode}` }}</div>
  </div>
</template>
<script setup lang="ts" name="SignSwitcher">
  import { computed, ref } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import PasswordSigner from './password-signer.vue';
  import handwritingSigner from './handwriting-signer.vue';
  import { SignMode } from '../constant';
  import type { GetSignImgByAccount, SignerExpose, SignerInstance, UploadSignFile } from '../types';

  const { t } = i18n.global;

  const signerRef = ref<SignerInstance>();

  const props = withDefaults(
    defineProps<{
      signMode?: SignMode;
      /** 固定签名模式，置灰显示一个签名模式 */
      fixSignMode?: boolean;
      hiddenSignMode?: boolean;
      getSignImgByAccount?: GetSignImgByAccount;
      uploadSignFile?: UploadSignFile;
      required: boolean;
      disableUserName?: boolean;
    }>(),
    {
      hiddenSignMode: false,
      required: false,
      fixSignMode: false,
      disableUserName: true,
    },
  );

  const emit = defineEmits<{
    (e: 'update:signMode', value: SignMode): void;
  }>();

  // 维护签名模式
  const localSignMode = ref<SignMode>(SignMode.HANDWRITING);
  const actualSignMode = computed({
    get() {
      return props.signMode === undefined ? localSignMode.value : props.signMode;
    },
    set(v) {
      localSignMode.value = v;
      emit('update:signMode', v);
    },
  });

  defineExpose<SignerExpose>({
    submit: async () => {
      return signerRef.value!.submit();
    },
  });
</script>
<style lang="less" scoped>
  .sign-switcher {
    width: 540px;

    .signer {
      width: 100%;
    }

    .sign-mode {
      :deep(.ant-form-item-explain) {
        display: none;
      }
      margin-bottom: 11px;
    }

    :deep(.ant-form-item-label:after) {
      display: none !important;
    }
  }
</style>
