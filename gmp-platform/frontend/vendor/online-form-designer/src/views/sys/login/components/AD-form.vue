<template>
  <Form
    class="enter-x"
    :model="formData"
    :rules="getFormRules"
    ref="formRef"
    @keypress.enter="handleLogin"
  >
    <FormItem name="account" class="enter-x" :extra="errorMessage">
      <Input
        size="large"
        v-model:value="formData.account"
        :placeholder="t(loginplaceholder)"
        class="fix-auto-fill"
        :class="{ 'error-input': errorStatus === 'error' }"
        @input="clearApiError"
        allowClear
      />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword
        v-no-copy-paste
        size="large"
        visibilityToggle
        v-model:value="formData.password"
        :placeholder="t('sys.passwordPlaceholder')"
        @input="clearApiError"
      />
    </FormItem>
    <FormItem class="enter-x">
      <Button
        class="login-btn"
        type="primary"
        size="large"
        block
        @click="handleLogin"
        :loading="loading"
      >
        {{ t('sys.loginButton') }}
      </Button>
    </FormItem>
  </Form>
</template>

<script setup lang="ts">
  import { reactive, ref, unref, computed } from 'vue';

  import { Form, Input, Button } from 'ant-design-vue';
  // import LoginFormTitle from './login-form-title.vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useUserStore } from '/@/store/modules/user';
  import {
    LoginStateEnum,
    useFormRules,
    useFormValid,
    useLoginState,
    useSHA256,
  } from '../useLogin';
  import { useDesign } from '/@/hooks/web/useDesign';
  //import { onKeyStroke } from '@vueuse/core';
  import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';

  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { notification, createErrorModal } = useMessage();
  const { prefixCls } = useDesign('login');
  const userStore = useUserStore();
  const { getSystemLogin } = useRootSetting();
  const { orgSetting } = useOrgSetting();

  const { getFormRules } = useFormRules();

  const formRef = ref();
  const loading = ref(false);

  const formData = reactive({
    account: '',
    password: '',
  });
  const errorStatus = ref('');
  const errorMessage = ref();
  const { validForm } = useFormValid(formRef);
  const { sha256 } = useSHA256();

  //onKeyStroke('Enter', handleLogin);

  const loginplaceholder = computed(() => {
    const supportLoginFields = getSystemLogin.value.filter((i) => {
      return i.authType === 'DOMAIN_ACCOUNT';
    })[0]?.relationField;
    if (supportLoginFields === 'username_') {
      return 'sys.accountPlaceholder';
    }
    if (supportLoginFields === 'mobile_') {
      return 'sys.mobilePlaceholder';
    }
    if (supportLoginFields === 'emp_no_') {
      return 'sys.empnoPlaceholder';
    }
    if (supportLoginFields === 'email_') {
      return 'sys.emailPlaceholder';
    }
    const filter = orgSetting.extFieldConfigs?.filter(
      (i) => i.relationField + '_' === supportLoginFields,
    );
    if (filter && filter.length) {
      return `请输入${filter[0].fieldName}`;
    }
    const supportLoginName = getSystemLogin.value.filter((i) => {
      return i.authType === 'DOMAIN_ACCOUNT';
    })[0]?.relationFieldName;
    if (supportLoginName) {
      return `请输入${supportLoginName}`;
    }
    return 'sys.accountPlaceholder';
  });
  async function handleLogin() {
    // key为随机数
    const key = Math.random().toString(16).substr(2, 8);
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;
      const userInfo = await userStore.login({
        password: data.password,
        username: data.account,
        mode: 'none', //不要默认的错误提示
        authCode: 'DOMAIN_ACCOUNT',
      });
      if (userInfo) {
        notification.success({
          message: t('sys.loginSuccessTitle'),
          description: `${t('sys.loginSuccessDesc')}: ${userInfo.fullname}`,
          duration: 3,
        });
      }
    } catch (error) {
      if (error && error.subCode !== 'sys.plat.api.pass.failure.over.max_times') {
        errorMessage.value = error.subMessage;
        errorStatus.value = 'error';
      }
      // createErrorModal({
      //   title: t('sys.errorTip'),
      //   content: (error as unknown as Error).message || t('sys.networkExceptionMsg'),
      //   getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      // });
    } finally {
      loading.value = false;
    }
  }
  function clearApiError() {
    if (errorStatus.value === 'error') {
      errorStatus.value = '';
      errorMessage.value = '';
    }
  }
</script>
<style lang="scss" scoped>
  // 错误状态下的输入框样式
  .error-input {
    border-color: #ff4d4f;

    &:focus {
      box-shadow: 0 0 0 2px rgb(255 77 79 / 20%);
    }
  }

  :deep(.ant-form-item-extra) {
    position: absolute;
    top: 40px;
    min-height: 0;
    color: #ff4d4f;
  }

  :deep(input.ant-input) {
    border-radius: 4px;
  }
</style>
