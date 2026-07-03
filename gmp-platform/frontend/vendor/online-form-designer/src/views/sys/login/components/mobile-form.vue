<template>
  <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef">
    <FormItem name="mobile" class="enter-x phone" :extra="errorMessage">
      <a-input-group compact>
        <div class="phone-country">
          <VueCountryIntl
            v-model:value="formData.country"
            size="large"
            :class="{ 'error-input': errorStatus === 'error' }"
          />
        </div>
        <Input
          size="large"
          v-model:value="formData.mobile"
          :placeholder="t('sys.mobile')"
          class="fix-auto-fill"
          style="border-radius: 0 4px 4px 0"
          :class="{ 'error-input': errorStatus === 'error' }"
          @input="clearApiError"
          allowClear
        />
      </a-input-group>
    </FormItem>
    <FormItem name="sms" class="enter-x">
      <CountdownInput
        size="large"
        class="fix-auto-fill"
        v-model:value="formData.sms"
        :placeholder="t('sys.smsCode')"
        :sendCodeApi="sendMsg"
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
<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';
  import { Form, Input, Button, message } from 'ant-design-vue';
  import { CountdownInput } from '/@/components/CountDown';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LoginStateEnum, useFormRules, useFormValid, useLoginState } from '../useLogin';
  import { VueCountryIntl } from '/@/components/VueCountryIntl';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { useRootSetting } from '@/hooks/setting/useRootSetting';
  import { postLoginSendMsg } from '/@/apis/gct-platform/LoginController';

  const FormItem = Form.Item;

  const { t } = useI18n();

  const formRef = ref();

  const loading = ref(false);

  // 平台设置相关
  const { getLoginModeConfigs } = useRootSetting();

  const formData = reactive({
    mobile: '',
    sms: '',
    country: '+86',
  });
  const errorStatus = ref('');
  const errorMessage = ref();
  const { getFormRules } = useFormRules(formData);

  const { notification } = useMessage();

  const userStore = useUserStore();

  const { validForm, validFormFields } = useFormValid(formRef);

  // const getShow = computed(() => unref(getLoginState) === LoginStateEnum.MOBILE);
  watch(
    () => formData,
    () => {
      clearApiError();
    },
    {
      deep: true,
    },
  );
  async function handleLogin() {
    const data = await validForm();

    if (!data) return;
    try {
      const userInfo = await userStore.login({
        password: formData.sms,
        username: formData.mobile,
        country: formData.country,
        authCode: 'MOBILE',
        mode: 'none',
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
    }
  }

  const sendMsg = async () => {
    const data = await validFormFields('mobile');

    if (!data) return;
    const config = getLoginModeConfigs.value?.filter((item) => item.authType === 'MOBILE')[0] || {};

    return postLoginSendMsg({
      accessKeyId: config.smsKey,
      accessKeySecret: config.smsKeySecret,
      phoneNumbers: formData.mobile,
      country: formData.country,
      serviceProvider: config.smsServiceProvider,
      signName: config.smsSignName,
      sdkAppId: config.smsSdkAppId,
      templateCode: config.smsTemplateCode,
    });
  };
  function clearApiError() {
    if (errorStatus.value === 'error') {
      errorStatus.value = '';
      errorMessage.value = '';
    }
  }
</script>

<style lang="less" scoped>
  :deep(.vue-country-intl-inputer .country-intl-input) {
    height: 39.74px;
  }
  :deep(.vue-country-intl-inputer .country-intl-label) {
    padding: 7px 15px;
    span {
      vertical-align: top;
    }
  }
  .phone-country {
    // display: inline-block;
    // height: 39.74px;
    width: 120px;
    // margin-right: -1px;
  }
  .phone {
    .ant-input,
    .ant-input-affix-wrapper {
      width: calc(100% - 120px);
    }
  }
  // 错误状态下的输入框样式
  .error-input {
    border-color: #ff4d4f;
    :deep(.ant-select-selector) {
      border-color: #ff4d4f;
    }
    &:focus {
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }
  }
  :deep(.ant-form-item-extra) {
    position: absolute;
    top: 40px;
    color: #ff4d4f;
    min-height: 0;
  }
  :deep(input.ant-input) {
    border-radius: 4px;
  }
</style>
