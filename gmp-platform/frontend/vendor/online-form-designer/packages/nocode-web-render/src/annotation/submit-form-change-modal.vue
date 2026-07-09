<template>
  <div :class="ns.b()">
    <a-form ref="formRef" :model="formData" :class="['content', 'gct-label-wrap-form']">
      <a-form-item name="signInfo">
        <SignSwitcher
          :required="true"
          ref="switchRef"
          :fix-sign-mode="true"
          :sign-mode="signMode"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { reactive, ref } from 'vue';
  import { message, type FormInstance } from 'ant-design-vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { SignerInstance, SignMode, SignSwitcher } from '/@/components/Signature';

  const ns = useNamespace('submit-form-change-modal');

  const switchRef = ref<SignerInstance>();
  const signMode = ref<SignMode | undefined>(SignMode.PASSWORD);

  const formData = reactive<IData>({
    signInfo: undefined,
  });

  const formRef = ref<FormInstance>();

  /** 上传签名并设置签名属性 */
  const setSignature = async () => {
    try {
      const signInfo = await switchRef.value?.submit();
      formData.signInfo = signInfo;
      console.log('保存', signInfo);
    } catch (error) {
      // 不需要抛出异常，如果是接口的异常，公共处已经处理，如果是没有签名，在内部已经处理提示错误
      // if (error.message) {
      //   message.error(error.message);
      // }
      throw error;
    }
  };

  useModal(async () => {
    await setSignature();
    await formRef.value?.validate();
    return {
      ok: true,
      data: [formData],
    };
  });
</script>

<style lang="scss" scoped>
  @include b(submit-form-change-modal) {
    padding-top: 12px;
    padding-left: 24px;
  }
</style>
