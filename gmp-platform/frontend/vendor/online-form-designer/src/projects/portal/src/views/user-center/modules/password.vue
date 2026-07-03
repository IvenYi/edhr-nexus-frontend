<template>
  <div style="height: 100%">
    <a-tabs
      v-if="getSecurityConfig.enableSignPassword == 1"
      v-model:activeKey="activeKey"
      :type="props.mode == 'modal' ? 'line' : 'card'"
      :tab-position="props.mode == 'modal' ? 'left' : 'top'"
    >
      <a-tab-pane key="LOGIN" :tab="t('sys.platform.loginPassword')">
        <a-form
          ref="formRef"
          :model="passwordModel"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 11 }"
          autocomplete="off"
          style="height: 100%"
        >
          <a-form-item
            :label="t('sys.platform.currentLoginPassword')"
            name="oldPassword"
            style="margin-top: 40px"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.currentLoginPassword'),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="passwordModel.oldPassword"
              :placeholder="t('sys.inputText') + t('sys.platform.currentLoginPassword')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.platform.newLoginPassword')"
            name="newPassword"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.newLoginPassword'),
                trigger: ['blur', 'change'],
              },
              {
                validator: () => checkPassword('newPassword', passwordModel.newPassword),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="passwordModel.newPassword"
              :placeholder="getPassLabel('passRule')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.platform.confirmLoginPassword')"
            name="confirm"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.confirmLoginPassword'),
                trigger: ['blur', 'change'],
              },
              {
                validator: () => checkPassword('confirm', passwordModel.confirm),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="passwordModel.confirm"
              :placeholder="getPassLabel('passRule')"
            />
          </a-form-item>
          <a-form-item label=" " :colon="false" v-show="props.mode != 'modal'">
            <a-button class="mr-12px" type="primary" @click="handleOk">
              {{ t('sys.saveText') }}
            </a-button>
            <a-button @click="handleClose">{{ t('sys.cancel') }}</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="SIGN" :tab="t('sys.platform.signaturePassword')">
        <a-form
          ref="signFormRef"
          :model="signPasswordModel"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 11 }"
          autocomplete="off"
          style="height: 100%"
        >
          <a-form-item
            style="margin-top: 40px"
            :label="t('sys.platform.currentSignPassword')"
            name="oldPassword"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.currentSignPassword'),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="signPasswordModel.oldPassword"
              :placeholder="t('sys.inputText') + t('sys.platform.newSignPassword')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.platform.newSignPassword')"
            name="newPassword"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.newSignPassword'),
                trigger: ['blur', 'change'],
              },
              {
                validator: () => checkSignPassword('newPassword', signPasswordModel.newPassword),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="signPasswordModel.newPassword"
              :placeholder="getPassLabel('signPassRule')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.platform.confirmSignPassword')"
            name="confirm"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.confirmSignPassword'),
                trigger: ['blur', 'change'],
              },
              {
                validator: () => checkSignPassword('confirm', signPasswordModel.confirm),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="signPasswordModel.confirm"
              :placeholder="getPassLabel('signPassRule')"
            />
          </a-form-item>
          <a-form-item label=" " :colon="false" v-show="props.mode != 'modal'">
            <a-button class="mr-12px" type="primary" @click="handleOk">
              {{ t('sys.saveText') }}
            </a-button>
            <a-button @click="handleClose">{{ t('sys.cancel') }}</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
    <a-form
      v-else
      ref="formRef"
      :model="passwordModel"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 11 }"
      autocomplete="off"
      style="height: 100%"
    >
      <a-form-item
        :label="t('sys.platform.currentLoginPassword')"
        name="oldPassword"
        style="margin-top: 40px"
        :rules="[
          {
            required: true,
            message: t('sys.inputText') + t('sys.platform.currentLoginPassword'),
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input-password
          v-model:value="passwordModel.oldPassword"
          :placeholder="t('sys.inputText') + t('sys.platform.currentLoginPassword')"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.platform.newLoginPassword')"
        name="newPassword"
        :rules="[
          {
            required: true,
            message: t('sys.inputText') + t('sys.platform.newLoginPassword'),
            trigger: ['blur', 'change'],
          },
          {
            validator: () => checkPassword('newPassword', passwordModel.newPassword),
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input-password
          v-model:value="passwordModel.newPassword"
          :placeholder="getPassLabel('passRule')"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.platform.confirmLoginPassword')"
        name="confirm"
        :rules="[
          {
            required: true,
            message: t('sys.inputText') + t('sys.platform.confirmLoginPassword'),
            trigger: ['blur', 'change'],
          },
          {
            validator: () => checkPassword('confirm', passwordModel.confirm),
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input-password
          v-model:value="passwordModel.confirm"
          :placeholder="getPassLabel('passRule')"
        />
      </a-form-item>
      <a-form-item label=" " :colon="false" v-show="props.mode != 'modal'">
        <a-button class="mr-12px" type="primary" @click="handleOk">
          {{ t('sys.saveText') }}
        </a-button>
        <a-button @click="handleClose">{{ t('sys.cancel') }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { type FormInstance, message } from 'ant-design-vue';
  // import { changePassword } from '/@/api/sys/login';
  import { postUserResetPwd } from '/@/apis/gct-platform/UserController';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { isEmpty } from 'lodash-es';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { PassRule } from '/@/hooks/platform/types';

  const userStore = useUserStoreWithOut();
  const { getSecurityConfig } = useRootSetting();
  const { sha256 } = useSHA256();
  const key = Math.random().toString(16).substring(2, 8);
  const { t } = useI18n();
  const formRef = ref<FormInstance>();

  const signFormRef = ref<FormInstance>();
  const props = defineProps<{
    mode?: string;
  }>();

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

  const signPasswordModel = reactive<PasswordModel>({
    oldPassword: '',
    newPassword: '',
    confirm: '',
  });

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

  const activeKey = ref('LOGIN');

  const handleOk = () => {
    if (activeKey.value === 'LOGIN') {
      formRef.value?.validate().then(async () => {
        await postUserResetPwd(
          {
            userId: userStore.getUserInfo.userId as string,
            newPassword: sha256(passwordModel.newPassword, key),
            oldPassword: sha256(passwordModel.oldPassword, key),
            type: activeKey.value,
          },
          {
            transferToConfig: { headers: { Module: 'TENANT_CENTER' } },
          },
        );
        message.success(t('sys.portal.changePwdSuccess'));
        handleClose();
        userStore.logout(true);
      });
    } else {
      signFormRef.value?.validate().then(async () => {
        await postUserResetPwd(
          {
            userId: userStore.getUserInfo.userId as string,
            newPassword: sha256(signPasswordModel.newPassword, key),
            oldPassword: sha256(signPasswordModel.oldPassword, key),
            type: activeKey.value,
          },
          {
            transferToConfig: { headers: { Module: 'TENANT_CENTER' } },
          },
        );
        message.success(t('sys.portal.changePwdSuccess'));
        handleClose();
      });
    }
  };

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const getPassLabel = (rule) => {
    if (
      !getSecurityConfig.value[rule === 'passRule' ? 'enablePassphrase' : 'signEnablePassphrase']
    ) {
      return t('sys.passwordErrorTip', {
        len: 6,
        text: '数字/大小写字母',
      });
    }
    const passRule = getSecurityConfig.value[rule];
    if (passRule?.length) {
      const lowAndUpperArr: string[] = [PassRule.LOWERCASE, PassRule.UPPERCASE];
      const hasLowAndUpper = lowAndUpperArr.every((e) => passRule?.includes(e));
      let passLabels = passRule?.map((val: string) => {
        let passItem = passOptions.value.find((item) => {
          if (hasLowAndUpper && lowAndUpperArr.includes(val)) {
            return 'LOWERCASE_UPPERCASE' === item.value;
          }
          return val == item.value;
        });
        return passItem?.label;
      });
      passLabels = [...new Set(passLabels)];
      return getSecurityConfig.value[rule === 'passRule' ? 'passMinLength' : 'signPassMinLength'] ==
        16
        ? t('sys.password16ErrorTip', {
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          })
        : t('sys.passwordErrorTip', {
            len: getSecurityConfig.value[
              rule === 'passRule' ? 'passMinLength' : 'signPassMinLength'
            ],
            text: passLabels.join('、'),
            group: passLabels.length > 1 || hasLowAndUpper ? t('sys.group') : '',
          });
    } else {
      return t('sys.passLenTip', {
        text: getSecurityConfig.value[rule === 'passRule' ? 'passMinLength' : 'signPassMinLength'],
      });
    }
  };

  const checkSignPassword = (type: string, password: any) => {
    const newPassword = signPasswordModel.newPassword;
    const confirmPassword = signPasswordModel.confirm;
    let flag = true;
    const passRuleStr = getPassLabel('signPassRule');
    if (getSecurityConfig.value.signEnablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword, 'signPassRule');
      if (!flag && password) {
        return Promise.reject(passRuleStr);
      }
      if (
        (getSecurityConfig.value.signPassMinLength &&
          getSecurityConfig.value.signPassMinLength > signPasswordModel[type].length &&
          signPasswordModel[type]) ||
        signPasswordModel[type].length > 16
      ) {
        return Promise.reject(passRuleStr);
      }
    } else {
      const reg = /^[a-zA-Z\d]{6,16}$/;
      if (!reg.test(signPasswordModel[type])) {
        return Promise.reject(passRuleStr);
      }
    }
    if (isEmpty(confirmPassword) || isEmpty(newPassword)) {
      return Promise.resolve();
    }
    if (confirmPassword !== newPassword) {
      return Promise.reject(t('sys.portal.signPasswordNotSame'));
    }
    formRef.value?.clearValidate(['confirm', 'newPassword']);
    return Promise.resolve();
  };

  const checkPassword = (type: string, password: any) => {
    const newPassword = passwordModel.newPassword;
    const confirmPassword = passwordModel.confirm;
    let flag = true;
    const passRuleStr = getPassLabel('passRule');
    if (getSecurityConfig.value.enablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword, 'passRule');
      if (!flag && password) {
        return Promise.reject(passRuleStr);
      }
      if (
        (getSecurityConfig.value.passMinLength &&
          getSecurityConfig.value.passMinLength > passwordModel[type].length &&
          passwordModel[type]) ||
        passwordModel[type].length > 16
      ) {
        return Promise.reject(passRuleStr);
      }
    } else {
      const reg = /^[a-zA-Z\d]{6,16}$/;
      if (!reg.test(passwordModel[type])) {
        return Promise.reject(passRuleStr);
      }
    }
    if (isEmpty(confirmPassword) || isEmpty(newPassword)) {
      return Promise.resolve();
    }
    if (confirmPassword !== newPassword) {
      return Promise.reject(t('sys.portal.passwordNotSame'));
    }
    formRef.value?.clearValidate(['confirm', 'newPassword']);
    return Promise.resolve();
  };

  // 验证规则
  const validatePassRule = (newPassword, confirmPassword, rule) => {
    const regexPatterns: RegExp[] = [];
    if (getSecurityConfig.value[rule]?.includes('NUMBER')) {
      regexPatterns.push(/\d/);
    }
    if (getSecurityConfig.value[rule]?.includes('LOWERCASE')) {
      regexPatterns.push(/[a-z]/);
    }
    if (getSecurityConfig.value[rule]?.includes('UPPERCASE')) {
      regexPatterns.push(/[A-Z]/);
    }
    if (getSecurityConfig.value[rule]?.includes('SPECHARS')) {
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
  defineExpose({
    handleOk,
    handleClose,
    passwordModel,
  });
</script>

<style lang="less" scoped>
  :deep(.ant-tabs) {
    height: 100%;
    .ant-tabs-top > .ant-tabs-nav {
      margin-bottom: 0;
    }
    .ant-tabs-content-top {
      border: 1px solid #f0f0f0;
      border-top: none;
    }
  }
</style>
