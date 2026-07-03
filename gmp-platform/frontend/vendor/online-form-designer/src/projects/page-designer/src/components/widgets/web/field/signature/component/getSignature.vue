<template>
  <div class="bg-[#FCFCFC] p12px">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.userName')" name="username" :rules="[{ required: true }]">
        <a-input v-model:value="formState.username" />
      </a-form-item>
      <a-form-item
        :label="t(`sys.platform.signWay.${getSignWay()}`)"
        name="password"
        :rules="[{ required: true }]"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      <div class="text-[#384356] text-[14px] cursor-pointer primary-gct text-right" @click="reset">
        <redo-outlined />
        {{ t('sys.reset') }}
      </div>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CryptoJS from 'crypto-js';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  // withDefaults(defineProps<{ formState: object }>(), {
  //   formState: () => {
  //     return { username: '', password: '' };
  //   },
  // });
  const formRef = ref();
  const { t } = useI18n();

  const { getSecurityConfig, getSignWay } = useRootSetting();
  const formState = ref({ password: '', username: '' });

  const reset = async () => {
    await formRef.value?.resetFields();
    formState.value = { password: '', username: '' };
  };

  function sha256(password) {
    const hash = CryptoJS.SHA256(password);
    return hash.toString(CryptoJS.enc.Hex);
  }

  const save = async () => {
    await formRef.value?.validate();
    return {
      username: formState.value.username,
      password:
        getSignWay() === 'DOMAIN' ? formState.value.password : sha256(formState.value.password),
      type: getSignWay(),
      enableSignPassword: getSecurityConfig.value.enableSignPassword,
    };
  };

  defineExpose({
    save,
  });
</script>
<style lang="less" scoped>
  .btn-wrap {
    border-top: 1px solid @gct-modal-border-color;
  }
</style>
