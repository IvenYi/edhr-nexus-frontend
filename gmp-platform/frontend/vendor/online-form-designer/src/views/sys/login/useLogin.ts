import { computed, ref, unref, Ref } from 'vue';
import { ValidationRule, FormInstance } from 'ant-design-vue/lib/form/Form';
import type { RuleObject, NamePath } from 'ant-design-vue/lib/form/interface';
import { useI18n } from '/@/hooks/web/useI18n';
import CryptoJS from 'crypto-js';
import { metadata, PhoneNumberUtil } from 'google-libphonenumber';
import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';

export enum LoginStateEnum {
  LOGIN, // 登录
  RESET_PASSWORD, // 重置密码
  PASSWORD, // 重置密码
  MOBILE, // 手机登录
  QR_CODE, // 二维码登录
  DOMAIN_ACCOUNT, // AD域登录
  CARD, // 刷卡登录
}

const currentState = ref(LoginStateEnum.LOGIN); // 初始化登录
const phoneUtil = PhoneNumberUtil.getInstance();

export function useLoginState() {
  function setLoginState(state: LoginStateEnum) {
    currentState.value = state;
  }
  const getLoginState = computed(() => currentState.value);
  function handleBackLogin() {
    setLoginState(LoginStateEnum.LOGIN);
  }
  return { setLoginState, getLoginState, handleBackLogin };
}

export function useFormValid<T extends Object = any>(formRef: Ref<FormInstance>) {
  const validate = computed(() => {
    const form = unref(formRef);
    return form?.validate ?? ((_nameList?: NamePath) => Promise.resolve());
  });

  async function validForm() {
    const form = unref(formRef);
    if (!form) return;
    const data = await form.validate();
    return data as T;
  }

  async function validFormFields(field) {
    const form = unref(formRef);
    if (!form) return;
    const data = await form.validateFields(field);
    return data as T;
  }

  return { validate, validForm, validFormFields };
}

export function useFormRules(formData?: Recordable) {
  const { t } = useI18n();
  const { orgSetting } = useOrgSetting();
  const { getSystemLogin } = useRootSetting();
  const getAccountFormRule = computed(() => createRule(t('sys.accountPlaceholder')));
  const getPasswordFormRule = computed(() => createRule(t('sys.passwordPlaceholder')));
  const getSmsFormRule = computed(() => createRule(t('sys.smsPlaceholder')));
  const getMobileFormRule = computed(() => createRule(t('sys.mobilePlaceholder')));

  // 密码登录字段
  const getLoginFormRule = computed(() => {
    if (orgSetting.supportLoginFields?.includes('username_')) {
      return createRule(t('sys.accountPlaceholder'));
    }
    if (orgSetting.supportLoginFields?.includes('mobile_')) {
      return createRule(t('sys.mobilePlaceholder'));
    }
    if (orgSetting.supportLoginFields?.includes('emp_no_')) {
      return createRule(t('sys.empnoPlaceholder'));
    }
    if (orgSetting.supportLoginFields?.includes('email_')) {
      return createRule(t('sys.emailPlaceholder'));
    }
    const filter = orgSetting.extFieldConfigs?.filter(
      (i) => i.relationField === orgSetting.supportLoginFields[0],
    );
    if (filter && filter.length) {
      return createRule(`请输入${filter[0].fieldName}`);
    }
    return createRule(t('sys.accountPlaceholder'));
  });

  const getLoginADFormRule = computed(() => {
    const supportLoginFields = getSystemLogin.value.filter((i) => {
      return i.authType === 'DOMAIN_ACCOUNT';
    })[0]?.relationField;
    if (supportLoginFields === 'username_') {
      return createRule(t('sys.accountPlaceholder'));
    }
    if (supportLoginFields === 'mobile_') {
      return createRule(t('sys.mobilePlaceholder'));
    }
    if (supportLoginFields === 'emp_no_') {
      return createRule(t('sys.empnoPlaceholder'));
    }
    if (supportLoginFields === 'email_') {
      return createRule(t('sys.emailPlaceholder'));
    }
    const filter = orgSetting.extFieldConfigs?.filter(
      (i) => i.relationField + '_' === supportLoginFields,
    );
    if (filter && filter.length) {
      return createRule(`请输入${filter[0].fieldName}`);
    }
    const supportLoginName = getSystemLogin.value.filter((i) => {
      return i.authType === 'DOMAIN_ACCOUNT';
    })[0]?.relationFieldName;
    if (supportLoginName) {
      return createRule(`请输入${supportLoginName}`);
    }
    return createRule(t('sys.accountPlaceholder'));
  });
  const validatePolicy = async (_: RuleObject, value: boolean) => {
    return !value ? Promise.reject(t('sys.policyPlaceholder')) : Promise.resolve();
  };

  const validateConfirmPassword = (password: string) => {
    return async (_: RuleObject, value: string) => {
      if (!value) {
        return Promise.reject(t('sys.passwordPlaceholder'));
      }
      if (value !== password) {
        return Promise.reject(t('sys.diffPwd'));
      }
      return Promise.resolve();
    };
  };
  const checkPhone = (country: string) => {
    return async (_rule: RuleObject, value: string) => {
      if (!value) {
        return Promise.resolve();
      }
      if (!Number.isFinite(+value) || value.length === 1 || value.length >= 17) {
        return Promise.reject(t('sys.phoneError'));
      }
      if (!metadata.countryCodeToRegionCodeMap[+country?.replace('+', '')]) {
        return Promise.resolve();
      }
      const number = phoneUtil.parseAndKeepRawInput(
        value,
        metadata.countryCodeToRegionCodeMap[+country?.replace('+', '')][0],
      );
      const isValite = phoneUtil.isValidNumber(number);

      if (!isValite) {
        return Promise.reject(t('sys.phoneError'));
      }
      return Promise.resolve();
    };
  };
  const getFormRules = computed((): { [k: string]: ValidationRule | ValidationRule[] } => {
    const accountFormRule = unref(getAccountFormRule);
    const passwordFormRule = unref(getPasswordFormRule);
    const smsFormRule = unref(getSmsFormRule);
    const mobileFormRule = unref(getMobileFormRule);
    const loginFormRule = unref(getLoginFormRule);
    const loginADFormRule = unref(getLoginADFormRule);

    const mobileRule = {
      sms: smsFormRule,
      mobile: mobileFormRule,
    };
    switch (unref(currentState)) {
      // register form rules
      case LoginStateEnum.PASSWORD:
        return {
          account: accountFormRule,
          password: passwordFormRule,
          confirmPassword: [
            { validator: validateConfirmPassword(formData?.password), trigger: 'change' },
          ],
          policy: [{ validator: validatePolicy, trigger: 'change' }],
          ...mobileRule,
        };

      case LoginStateEnum.DOMAIN_ACCOUNT:
        return {
          account: loginADFormRule,
          password: passwordFormRule,
        };

      case LoginStateEnum.LOGIN:
        return {
          account: loginFormRule,
          password: passwordFormRule,
        };

      // reset password form rules
      case LoginStateEnum.RESET_PASSWORD:
        return {
          account: accountFormRule,
          ...mobileRule,
        };

      // mobile form rules
      case LoginStateEnum.MOBILE:
        return {
          ...mobileRule,
          mobile: [{ validator: checkPhone(formData?.country), trigger: 'blur' }],
        };

      // login form rules
      default:
        return {
          account: accountFormRule,
          password: passwordFormRule,
        };
    }
  });
  return { getFormRules };
}

export function useSHA256() {
  function sha256(password, key) {
    const hash = CryptoJS.SHA256(password);
    return hash.toString(CryptoJS.enc.Hex);
  }
  return { sha256 };
}

function createRule(message: string) {
  return [
    {
      required: true,
      message,
      trigger: 'change',
    },
  ];
}
