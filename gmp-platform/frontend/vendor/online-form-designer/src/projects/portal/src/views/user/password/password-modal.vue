<template>
  <BasicModal
    v-bind="$attrs"
    :title="t('sys.changePassword')"
    centered
    width="700px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @register="register"
  >
    <a-form
      ref="formRef"
      :model="passwordModel"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.currentPassword')"
        name="oldPassword"
        :rules="[{ required: true }]"
      >
        <a-input-password v-model:value="passwordModel.oldPassword" />
      </a-form-item>
      <a-form-item
        :label="t('sys.newPassword')"
        name="newPassword"
        :rules="[
          { required: true },
          { validator: () => checkPassword('newPassword'), trigger: 'change' },
        ]"
      >
        <a-input-password v-model:value="passwordModel.newPassword" />
      </a-form-item>
      <a-form-item
        :label="t('sys.confirmPassword')"
        name="confirm"
        :rules="[
          { required: true },
          { validator: () => checkPassword('confirm'), trigger: 'change' },
        ]"
      >
        <a-input-password v-model:value="passwordModel.confirm" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { type FormInstance } from 'ant-design-vue';
  import { changePassword } from '/@/api/sys/login';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { isEmpty } from 'lodash-es';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  const userStore = useUserStoreWithOut();
  const { getSecurityConfig } = useRootSetting();
  const { sha256 } = useSHA256();
  const key = Math.random().toString(16).substring(2, 8);
  const { t } = useI18n();
  const formRef = ref<FormInstance>();
  const [register, { closeModal }] = useModalInner();
  interface PasswordModel {
    oldPassword: string;
    newPassword: string;
    confirm: string;
  }
  const passwordModel = reactive<PasswordModel>({
    oldPassword: '',
    newPassword: '',
    confirm: '',
  });
  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      await changePassword({
        userId: userStore.getUserInfo.userId as string,
        newPassword: sha256(passwordModel.newPassword, key),
        oldPassword: sha256(passwordModel.oldPassword, key),
      });
      console.log(passwordModel);
      closeModal();
      userStore.logout(true);
    });
  };
  const handleClose = () => {
    formRef.value?.resetFields();
  };
  const checkPassword = (type) => {
    const newPassword = passwordModel.newPassword;
    const confirmPassword = passwordModel.confirm;
    let flag = true;
    if (getSecurityConfig.value.enablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword);
      if (!flag) {
        return Promise.reject(t('sys.platform.passwordFormatError'));
      }
      if (
        getSecurityConfig.value.passMinLength &&
        getSecurityConfig.value.passMinLength > passwordModel[type].length
      ) {
        return Promise.reject(t('sys.platform.passwordLengthError'));
      }
    } else if (/^(?![\u4e00-\u9fa5])\S{6,16}$/.test(passwordModel[type])) {
      return Promise.reject(t('sys.passwordFormatError'));
    }
    if (isEmpty(confirmPassword) || isEmpty(newPassword)) {
      return Promise.resolve();
    }
    if (confirmPassword !== newPassword) {
      return Promise.reject(t('sys.portal.passwordNotSame'));
    }
    formRef.value?.clearValidate(['confirm', 'oldPassword']);
    return Promise.resolve();
  };

  // 验证规则
  const validatePassRule = (confirmPassword, newPassword) => {
    const regexPatterns: RegExp[] = [];
    if (getSecurityConfig.value.passRule?.includes('NUMBER')) {
      regexPatterns.push(/\d/);
    }
    if (getSecurityConfig.value.passRule?.includes('LOWERCASE')) {
      regexPatterns.push(/[a-z]/);
    }
    if (getSecurityConfig.value.passRule?.includes('UPPERCASE')) {
      regexPatterns.push(/[A-Z]/);
    }
    if (getSecurityConfig.value.passRule?.includes('SPECHARS')) {
      regexPatterns.push(/[!@#$%^&*()_+[\]{};':"\\|,.<>/?]/);
    }
    if (
      confirmPassword &&
      newPassword &&
      regexPatterns.every((pattern) => pattern.test(confirmPassword)) &&
      regexPatterns.every((pattern) => pattern.test(newPassword))
    ) {
      return true;
    } else if (
      confirmPassword &&
      !newPassword &&
      regexPatterns.every((pattern) => pattern.test(confirmPassword))
    ) {
      return true;
    } else if (
      newPassword &&
      !confirmPassword &&
      regexPatterns.every((pattern) => pattern.test(newPassword))
    ) {
      return true;
    } else {
      return false;
    }
  };
</script>

<style lang="ts" scoped></style>
