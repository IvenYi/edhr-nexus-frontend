<template>
  <BasicModal
    v-bind="$attrs"
    :title="t('sys.mySettings')"
    centered
    width="700px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.avatar')" name="avatar">
        <CropperAvatar
          :uploadApi="uploadApi"
          v-model:value="formState.avatar"
          :showBtn="false"
          width="88"
        />
      </a-form-item>
      <a-form-item :label="t('sys.fullname')" name="fullname" :rules="[{ required: true }]">
        <a-input v-model:value="formState.fullname" />
      </a-form-item>
      <a-form-item :label="t('sys.mobile')" name="mobile">
        <a-input v-model:value="formState.mobile" />
      </a-form-item>
      <a-form-item :label="t('sys.email')" name="email" :rules="[{ type: 'email' }]">
        <a-input v-model:value="formState.email" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance } from 'ant-design-vue';
  import { CropperAvatar } from '/@/components/Cropper';
  import { uploadApi } from '/@/api/sys/upload';
  import { useUserStore } from '/@/store/modules/user';
  import headerImg from '/@/assets/images/header.jpg';
  import { updateUserSetting } from '/@/api/sys/login';
  const { t } = useI18n();
  const userStore = useUserStore();
  const formRef = ref<FormInstance>();
  interface FormState {
    avatar: string;
    fullname: string;
    mobile?: string;
    email?: string;
  }
  const formState = reactive<FormState>({
    avatar: userStore.getUserInfo.avatar || headerImg,
    fullname: userStore.getUserInfo.fullname,
    mobile: userStore.getUserInfo.mobile,
    email: userStore.getUserInfo.email,
  });

  const handleOk = () => {
    window.console.log(formState);
    formRef.value?.validate().then(async () => {
      await updateUserSetting({
        ...formState,
      });
      location.reload();
    });
  };
  const handleClose = () => {
    formRef.value?.resetFields();
  };
</script>

<style scoped></style>
