<template>
  <div class="h100%">
    <a-form
      ref="formRef"
      :model="passwordModel"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 11 }"
      autocomplete="off"
      style="height: 100%"
      :scrollToFirstError="true"
    >
      <a-tabs v-model:activeKey="activeKey" tab-position="left" v-if="props.type === 'BOTH'">
        <a-tab-pane key="LOGIN" :tab="t('sys.platform.loginPassword')">
          <a-form-item
            :label="t('sys.platform.currentLoginPassword')"
            name="oldPassword"
            style="padding-top: 40px"
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
        </a-tab-pane>
        <a-tab-pane key="SIGN" :tab="t('sys.platform.signaturePassword')" :forceRender="true">
          <a-form-item
            style="padding-top: 40px"
            :label="t('sys.platform.currentSignPassword')"
            name="oldSignPassword"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.currentSignPassword'),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="passwordModel.oldSignPassword"
              :placeholder="t('sys.inputText') + t('sys.platform.newSignPassword')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.platform.newSignPassword')"
            name="newSignPassword"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.newSignPassword'),
                trigger: ['blur', 'change'],
              },
              {
                validator: () =>
                  checkSignPassword('newSignPassword', passwordModel.newSignPassword),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="passwordModel.newSignPassword"
              :placeholder="getPassLabel('signPassRule')"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.platform.confirmSignPassword')"
            name="confirmSign"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.platform.confirmSignPassword'),
                trigger: ['blur', 'change'],
              },
              {
                validator: () => checkSignPassword('confirmSign', passwordModel.confirmSign),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input-password
              v-model:value="passwordModel.confirmSign"
              :placeholder="getPassLabel('signPassRule')"
            />
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
      <template v-if="props.type === 'LOGIN'">
        <a-form-item
          :label="t('sys.platform.currentLoginPassword')"
          name="oldPassword"
          style="padding-top: 40px"
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
      </template>

      <a-form-item
        v-if="props.type === 'SIGN'"
        style="padding-top: 40px"
        :label="t('sys.platform.currentSignPassword')"
        name="oldSignPassword"
        :rules="[
          {
            required: true,
            message: t('sys.inputText') + t('sys.platform.currentSignPassword'),
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input-password
          v-model:value="passwordModel.oldSignPassword"
          :placeholder="t('sys.inputText') + t('sys.platform.newSignPassword')"
        />
      </a-form-item>
      <a-form-item
        v-if="props.type === 'SIGN' || props.type === 'ADD'"
        :style="{ 'margin-top': props.type === 'ADD' ? '40px' : 0 }"
        :label="
          props.type === 'ADD'
            ? t('sys.platform.signaturePassword')
            : t('sys.platform.newSignPassword')
        "
        name="newSignPassword"
        :rules="[
          {
            required: true,
            message:
              t('sys.inputText') +
              (props.type === 'ADD'
                ? t('sys.platform.signaturePassword')
                : t('sys.platform.newSignPassword')),
            trigger: ['blur', 'change'],
          },
          {
            validator: () => checkSignPassword('newSignPassword', passwordModel.newSignPassword),
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input-password
          v-model:value="passwordModel.newSignPassword"
          :placeholder="getPassLabel('signPassRule')"
        />
      </a-form-item>
      <a-form-item
        v-if="props.type === 'SIGN' || props.type === 'ADD'"
        :label="t('sys.platform.confirmSignPassword')"
        name="confirmSign"
        :rules="[
          {
            required: true,
            message: t('sys.inputText') + t('sys.platform.confirmSignPassword'),
            trigger: ['blur', 'change'],
          },
          {
            validator: () => checkSignPassword('confirmSign', passwordModel.confirmSign),
            trigger: ['blur', 'change'],
          },
        ]"
      >
        <a-input-password
          v-model:value="passwordModel.confirmSign"
          :placeholder="getPassLabel('signPassRule')"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { type FormInstance, message } from 'ant-design-vue';
  import { changePassword } from '/@/api/sys/login';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { isEmpty } from 'lodash-es';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { PassRule } from '/@/hooks/platform/types';
  import { postUserResetAllpwd } from '/@/apis/gct-platform/UserController';

  const userStore = useUserStoreWithOut();
  const { getSecurityConfig } = useRootSetting();
  const { sha256 } = useSHA256();
  const key = Math.random().toString(16).substring(2, 8);
  const { t } = useI18n();
  const formRef = ref<FormInstance>();
  const emit = defineEmits(['getPwdInfo']);
  const props = defineProps<{
    type: string;
  }>();
  interface PasswordModel {
    oldPassword: string;
    newPassword: string;
    confirm: string;
    oldSignPassword: string;
    newSignPassword: string;
    confirmSign: string;
  }

  const passwordModel = reactive<PasswordModel>({
    oldPassword: '',
    newPassword: '',
    confirm: '',
    oldSignPassword: '',
    newSignPassword: '',
    confirmSign: '',
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
    formRef.value
      ?.validate()
      .then(async () => {
        await postUserResetAllpwd({
          userId: userStore.getUserInfo.userId as string,
          newPassword: passwordModel.newPassword ? sha256(passwordModel.newPassword, key) : '',
          oldPassword: passwordModel.oldPassword ? sha256(passwordModel.oldPassword, key) : '',
          oldSignPassword: passwordModel.oldSignPassword
            ? sha256(passwordModel.oldSignPassword, key)
            : '',
          newSignPassword: passwordModel.newSignPassword
            ? sha256(passwordModel.newSignPassword, key)
            : '',
        });
        if (props.type === 'ADD') {
          message.success(t('sys.platform.setSuccess'));
        } else {
          message.success(t('sys.portal.changePwdSuccess'));
        }

        if (passwordModel.newPassword) {
          userStore.logout(true);
        }
        handleClose();
        emit('getPwdInfo');
      })
      .catch((err) => {
        if (err.errorFields && err.errorFields.length && props.type === 'BOTH') {
          if (err.errorFields[0].name[0].includes('Sign')) {
            activeKey.value = 'SIGN';
          } else {
            activeKey.value = 'LOGIN';
          }
        }
      });
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
    const newPassword = passwordModel.newSignPassword;
    const confirmPassword = passwordModel.confirmSign;
    let flag = true;
    const passRuleStr = getPassLabel('signPassRule');
    if (getSecurityConfig.value.signEnablePassphrase) {
      flag = validatePassRule(newPassword, confirmPassword, 'signPassRule');
      if (!flag && password) {
        return Promise.reject(passRuleStr);
      }
      if (
        (getSecurityConfig.value.signPassMinLength &&
          getSecurityConfig.value.signPassMinLength > passwordModel[type].length &&
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
      return Promise.reject(t('sys.portal.signPasswordNotSame'));
    }
    formRef.value?.clearValidate(['confirmSign', 'newSignPassword']);
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
