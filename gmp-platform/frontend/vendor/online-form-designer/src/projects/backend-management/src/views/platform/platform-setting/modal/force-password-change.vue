<template>
  <div class="force_password_modal">
    <basic-modal
      v-bind="$attrs"
      @register="registerInner"
      :title="t('sys.platform.forceChangePassword')"
      centered
      width="640px"
      :minHeight="150"
      :maskClosable="false"
      :afterClose="handleClose"
      @ok="handleOk"
    >
      <div class="mb-12px">
        <a-alert banner message="Warning Text" type="warning" />
      </div>
      <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item
          :label="t('sys.platform.newPassword')"
          name="newPassword"
          :rules="[{ required: true }]"
        >
          <a-input v-model:value="formState.newPassword" />
        </a-form-item>
        <a-form-item
          :label="t('sys.platform.confirmPassword')"
          name="confirmPassword"
          :rules="[{ required: true }]"
        >
          <a-input v-model:value="formState.confirmPassword" />
        </a-form-item>
      </a-form>
    </basic-modal>
  </div>
</template>

<script lang="ts" setup>
  import { FormInstance, message } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { postUserResetPwd } from '/@/apis/gct-platform/UserController';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUserStore } from '/@/store/modules/user';

  const [registerInner, { closeModal }] = useModalInner();
  const { t } = useI18n();
  const userStore = useUserStore();
  const formRef = ref<FormInstance>();

  const formState = reactive({
    newPassword: '',
    confirmPassword: '',
  });

  const handleClose = () => {};

  // 确认
  const handleOk = async () => {
    await formRef.value?.validate();
    const data = {
      userId: userStore.userInfo?.userId,
      newPassword: formState.newPassword,
      oldPassword: '',
    };
    await postUserResetPwd(data);
    message.success('密码修改成功！');
    closeModal();
  };
</script>

<style lang="less"></style>
