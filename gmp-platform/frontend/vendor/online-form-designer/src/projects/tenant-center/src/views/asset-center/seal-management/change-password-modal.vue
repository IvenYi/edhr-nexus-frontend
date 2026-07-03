<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.changePassword')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="pl-60px pr-90px">
      <a-form ref="formRef" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 24 }">
        <a-form-item
          :label="t('sys.currentPassword')"
          name="oldPassword"
          :rules="[{ required: true, trigger: ['change', 'blur', 'submit'] }]"
        >
          <a-input-password v-model:value="formState.oldPassword" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          :label="t('sys.newPassword')"
          name="password"
          :rules="[
            { required: true, trigger: ['change', 'blur', 'submit'] },
            {
              validator: () => checkPassword('password', formState.password || ''),
              trigger: ['blur', 'change'],
            },
          ]"
        >
          <a-input-password
            v-model:value="formState.password"
            :placeholder="getPasswordPlaceholder()"
          />
        </a-form-item>
        <a-form-item
          :label="t('sys.confirmPassword')"
          name="_password"
          :rules="[
            { required: true, trigger: ['change', 'blur', 'submit'], message: '请再次输入新密码' },
            {
              validator: () => checkPassword('_password', formState._password || ''),
              trigger: ['blur', 'change'],
            },
          ]"
        >
          <a-input-password
            v-model:value="formState._password"
            :placeholder="getPasswordPlaceholder()"
          />
        </a-form-item>
      </a-form>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { SealManagementRequest } from '/@/apis/gct-platform/model';
  import { postSealManagementUpdatePassword } from '/@/apis/gct-platform/SealManagementController';
  import { isEmpty, omit } from 'lodash-es';
  import { PassRule } from '/@/hooks/platform/types';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const { getSecurityConfig } = useRootSetting();

  const formRef = ref<FormInstance>();

  const passOptions = ref([
    {
      label: t('sys.number'),
      value: PassRule.NUMBER,
    },
    {
      label: t('sys.lowercase'),
      value: PassRule.LOWERCASE,
    },
    {
      label: t('sys.uppercase'),
      value: PassRule.UPPERCASE,
    },
    {
      label: t('sys.spechars'),
      value: PassRule.SPECHARS,
    },
    {
      label: t('sys.lowercaseAndUppercase'),
      value: 'LOWERCASE_UPPERCASE',
    },
  ]);

  const formState: Partial<SealManagementRequest & { _password: string }> = reactive({
    id: '',
    oldPassword: '',
    password: '',
    _password: '',
  });

  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    const { record } = data;
    Object.assign(formState, {
      id: record.id,
    });
  });

  const getPasswordPlaceholder = () => {
    if (!getSecurityConfig.value.sealEnablePassphrase) {
      return t('sys.passwordErrorTip', {
        len: 6,
        text: t('sys.tenant.assetCenter.sealManagement.invalidTip'),
      });
    }
    const rules = getSecurityConfig.value.sealPassRule;
    if (rules?.length) {
      const lowAndUpperArr: string[] = [PassRule.LOWERCASE, PassRule.UPPERCASE];
      const hasLowAndUpper = lowAndUpperArr.every((e) => rules?.includes(e));
      let passLabels = rules?.map((val: string) => {
        let passItem = passOptions.value.find((item) => {
          if (hasLowAndUpper && lowAndUpperArr.includes(val)) {
            return 'LOWERCASE_UPPERCASE' === item.value;
          }
          return val == item.value;
        });
        return passItem?.label;
      });
      passLabels = [...new Set(passLabels)];
      return getSecurityConfig.value.sealPassMinLength === 16
        ? t('sys.password16ErrorTip', {
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          })
        : t('sys.passwordErrorTip', {
            len: getSecurityConfig.value.sealPassMinLength,
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          });
    } else {
      return t('sys.passLenTip', {
        text: getSecurityConfig.value.sealPassMinLength,
      });
    }
  };

  // 验证规则
  const validatePassRule = (newPassword, confirmPassword) => {
    const regexPatterns: RegExp[] = [];
    const rules = getSecurityConfig.value.sealPassRule;
    if (rules?.includes('NUMBER')) {
      regexPatterns.push(/\d/);
    }
    if (rules?.includes('LOWERCASE')) {
      regexPatterns.push(/[a-z]/);
    }
    if (rules?.includes('UPPERCASE')) {
      regexPatterns.push(/[A-Z]/);
    }
    if (rules?.includes('SPECHARS')) {
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

  const checkPassword = (type: 'password' | '_password', password: string) => {
    if (!password) return Promise.resolve();

    const { password: newPassword, _password: confirmPassword } = formState;

    let flag = true;
    const passRuleStr = getPasswordPlaceholder();
    if (getSecurityConfig.value.sealEnablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword);
      if (!flag && password) {
        return Promise.reject(passRuleStr);
      }
      if (
        (getSecurityConfig.value.sealPassMinLength &&
          getSecurityConfig.value.sealPassMinLength > formState[type]!.length &&
          formState[type]) ||
        formState[type]!.length > 16
      ) {
        return Promise.reject(passRuleStr);
      }
    } else {
      const reg = /^[a-zA-Z\d]{6,16}$/;
      if (!reg.test(formState[type]!)) {
        return Promise.reject(passRuleStr);
      }
    }
    if (isEmpty(confirmPassword) || isEmpty(newPassword)) {
      return Promise.resolve();
    }
    if (confirmPassword !== newPassword) {
      return Promise.reject(t('sys.portal.passwordNotSame'));
    }
    formRef.value?.clearValidate(['password', '_password']);
    return Promise.resolve();
  };

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await postSealManagementUpdatePassword(omit(formState, '_password'));
      message.success(t('sys.model.modifySuccess'));
      closeModal();
      emit('ok');
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>
<style lang="less" scoped>
  :deep(.ant-form-item-with-help .ant-form-item-explain) {
    position: absolute;
    top: 31px;
  }
  :deep(.ant-form .ant-form-item){
    margin-bottom: 24px;
  }
</style>
