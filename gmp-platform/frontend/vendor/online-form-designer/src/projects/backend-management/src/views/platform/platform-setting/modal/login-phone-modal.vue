<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="`${t(`sys.platform.${mode?.label}`)}${t('sys.config')}`"
    centered
    width="640px"
    :minHeight="40"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.platform.smsServiceProvider')"
        name="smsServiceProvider"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.smsServiceProvider"
          style="width: 70%"
          :options="serviceOptions"
          @change="providerChange"
        />
      </a-form-item>
      <a-form-item
        :label="relationIdText[formState.smsServiceProvider]"
        name="smsKey"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.smsKey"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        :label="relationSecretText[formState.smsServiceProvider]"
        name="smsKeySecret"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.smsKeySecret"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        v-if="formState.smsServiceProvider === 'tengxun'"
        label="smsSdkAppId"
        name="smsSdkAppId"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.smsSdkAppId"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        :label="
          formState.smsServiceProvider === 'huawei'
            ? t('sys.platform.signNameRoute')
            : t('sys.platform.smsSignName')
        "
        name="smsSignName"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.smsSignName"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
      </a-form-item>
      <a-form-item
        :label="`${t('sys.platform.smsTemplateCode')}${
          formState.smsServiceProvider == 'ali' ? t('sys.platform.code') : 'ID'
        }`"
        name="smsTemplateCode"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.smsTemplateCode"
          :placeholder="t('sys.inputText')"
          style="width: 70%"
        />
        <div class="template-code">{{ t('sys.platform.mobileCapcheCode') }}</div>
      </a-form-item>
      <a-form-item :label="t('sys.platform.phoneNumb')" name="phoneNumb">
        <div class="phone-country">
          <VueCountryIntl v-model:value="formState.country" />
        </div>

        <a-input
          v-model:value="formState.phoneNumb"
          :placeholder="t('sys.inputText')"
          style="width: calc(70% - 84px); border-radius: 0 4px 4px 0"
        />
        <a-button class="examine-phone" @click="sendMsg()">{{ t('sys.test') }}</a-button>
      </a-form-item>
      <a-form-item :label="t('sys.SignType')">
        <a-checkbox v-model:checked="formState.boolDefaultLoginMethod" :disabled="mode.isCurrent">
          {{ t('sys.platform.setDefaultLoginMethod') }}
        </a-checkbox>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { FormInstance, message } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useLoginSetting } from '/@/hooks/platform/useLoginSetting';
  import { SystemLoginKeys } from '/@/hooks/platform/constants';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { VueCountryIntl } from '/@/components/VueCountryIntl';
  import { postSmsSendMsg } from '/@/apis/gct-platform/SmsController';
  import { Rule } from 'ant-design-vue/es/form';

  const { loginModeConfig, loginModeAuthTypes, loginSetting } = useLoginSetting();
  const { t } = useI18n();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDeactivated(data);
  });

  const formRef = ref<FormInstance>();

  const mode = reactive({
    label: '',
    value: '',
    icon: '',
    isCurrent: false,
    type: '',
  });

  const formState = reactive({
    smsServiceProvider: 'ali', // 短信服务商
    smsKey: '', // 授权key
    smsKeySecret: '', // 授权secret
    smsTemplateCode: '', // 模板代码
    smsSignName: '', // 短信签名
    phoneNumb: '',
    boolDefaultLoginMethod: false,
    country: '+86',
    smsSdkAppId: '',
  });

  /** 短信服务商选项 */
  const serviceOptions = ref([
    {
      value: 'ali',
      label: t('sys.platform.ali'),
    },
    {
      value: 'huawei',
      label: t('sys.platform.huawei'),
    },
    {
      value: 'tengxun',
      label: t('sys.platform.tengxun'),
    },
  ]);

  /** ID名称 */
  const relationIdText = ref({
    ali: 'Access Key ID',
    huawei: 'App_Key',
    tengxun: 'Access Key ID',
  });

  /** secret名称 */
  const relationSecretText = ref({
    ali: 'Access Key Secret',
    huawei: 'App_Secret',
    tengxun: 'Access Key Secret',
  });

  const onDeactivated = (data) => {
    const { label, icon, value, type } = data;
    mode.type = type || '';
    mode.value = value;
    mode.label = label;
    mode.icon = icon;
    mode.isCurrent = data.isCurrent;

    formState.smsServiceProvider = data.smsServiceProvider || 'ali';
    formState.smsKey = data.smsKey;
    formState.smsKeySecret = data.smsKeySecret;
    formState.smsTemplateCode = data.smsTemplateCode;
    formState.smsSignName = data.smsSignName;
    formState.smsSdkAppId = data.smsSdkAppId;

    formState.boolDefaultLoginMethod = data.defaultAuthType === value;
  };

  const checkPhone = async (_rule: Rule, value: string) => {
    if (formState.country !== '+86') {
      return Promise.resolve();
    }
    const pwdRegex = new RegExp(/^1[3456789]\d{9}$/);
    if (!pwdRegex.test(value)) {
      return Promise.reject('电话号码输入格式有误');
    } else {
      return Promise.resolve();
    }
  };

  const sendMsg = () => {
    formRef.value?.validate().then(async () => {
      postSmsSendMsg({
        accessKeyId: formState.smsKey,
        accessKeySecret: formState.smsKeySecret,
        phoneNumbers: formState.phoneNumb,
        country: formState.country,
        serviceProvider: formState.smsServiceProvider,
        signName: formState.smsSignName,
        templateCode: formState.smsTemplateCode,
        sdkAppId: formState.smsSdkAppId,
      }).then(() => {
        message.success(t('sys.platform.sendMessage'));
      });
    });
  };

  /** 短信服务商改变清除其他已填字段 */
  const providerChange = (value) => {
    formRef.value?.resetFields();
    formState.smsServiceProvider = value;
  };

  const handleClose = () => {
    formState.smsServiceProvider = 'ali';
    formRef.value?.resetFields();
    closeModal();
  };

  const handleOk = async () => {
    formRef.value?.validate().then(async () => {
      loginModeConfig.get(mode.value).smsServiceProvider = formState.smsServiceProvider;
      loginModeConfig.get(mode.value).smsKey = formState.smsKey;
      loginModeConfig.get(mode.value).smsKeySecret = formState.smsKeySecret;
      loginModeConfig.get(mode.value).smsSdkAppId = formState.smsSdkAppId;
      loginModeConfig.get(mode.value).smsTemplateCode = formState.smsTemplateCode;
      loginModeConfig.get(mode.value).smsSignName = formState.smsSignName;
      if (formState.boolDefaultLoginMethod && !mode.isCurrent) {
        loginSetting.defaultAuthType = mode.value;

        if (!loginModeAuthTypes.value.includes(mode.value)) {
          loginModeAuthTypes.value.push(mode.value);
        }
      }
      closeModal();
    });
  };
</script>

<style lang="less" scoped>
  .phone-country {
    display: inline-block;
    width: 84px;
    margin-right: -1px;
  }
  :deep(.vue-country-intl-inputer .country-intl-input) {
    height: 31.6px;
  }
  :deep(.vue-country-intl-inputer .country-intl-label) {
    padding: 4px 10px;
    span {
      vertical-align: top;
    }
  }
  .examine-phone {
    margin-left: 8px;
  }
  .template-code {
    font-size: 14px;
    color: #8f8f8f;
  }
</style>
