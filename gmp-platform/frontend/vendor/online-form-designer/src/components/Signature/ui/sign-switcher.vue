<template>
  <div :class="[ns.b(), 'ant-form-horizontal']">
    <a-form-item
      :class="[ns.e('sign-mode')]"
      :required="required"
      v-if="!hiddenSignMode"
      :label="t('sys.pageDesigner.signatureType')"
      help=""
    >
      <a-radio-group v-model:value="actualSignMode" name="radioGroup">
        <a-radio
          v-if="!fixSignMode || signMode === SignMode.HANDWRITING"
          :value="SignMode.HANDWRITING"
          >{{ t('sys.pageDesigner.handwrittenSignature') }}</a-radio
        >
        <a-radio v-if="!fixSignMode || signMode === SignMode.PASSWORD" :value="SignMode.PASSWORD">{{
          t('sys.platform.ACCOUNT')
        }}</a-radio>
      </a-radio-group>
    </a-form-item>
    <PasswordSigner
      :class="ns.e('signer')"
      v-if="actualSignMode === SignMode.PASSWORD"
      ref="signerRef"
      :get-sign-img-by-account="getSignImgByAccount"
      :disable-user-name="disableUserName"
    />
    <handwritingSigner
      :class="ns.e('signer')"
      v-else-if="actualSignMode === SignMode.HANDWRITING"
      ref="signerRef"
      :upload-sign-file="uploadSignFile"
    />
    <div v-else>{{ `不支持的类型${actualSignMode}` }}</div>
  </div>
</template>
<script setup lang="ts" name="SignSwitcher">
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import PasswordSigner from './password-signer.vue';
  import handwritingSigner from './handwriting-signer.vue';
  import { SignMode } from '../constant';
  import { GetSignImgByAccount, SignerExpose, SignerInstance, UploadSignFile } from '../types';
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('sign-switcher');

  const { t } = useI18n();
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
<style lang="scss" scoped>
  @include b(sign-switcher) {
    width: 540px;

    @include e(signer) {
      width: 100%;
    }

    @include e(sign-mode) {
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
