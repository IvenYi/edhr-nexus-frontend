import { reactive, ref } from 'vue';
import { PlatformSettingEnum } from './types';
import {
  LoginTypeEnum,
  LoginSortTypeEnum,
  getLoginTypeOptions,
  SystemLoginKeys,
  OtherLoginKeys,
} from './constants';
import { AuthConfig } from '/@/apis/gct-platform/model';
import {
  getPlatInfo,
  getPlatCardLoginCfg,
  postPlatLogin,
} from '/@/apis/gct-platform/PlatformConfigController';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';
import { has, isEmpty } from 'lodash-es';

// 选中的系统登录keys
const loginModeAuthTypes = ref<string[]>([LoginTypeEnum.ACCOUNT]);
// 第三方登录的keys
const openIDOAuthAuthTypes = ref<string[]>([]);

// 系统登录排序
const sysLoginSort = ref<any[]>(getLoginTypeOptions(SystemLoginKeys));

// 第三方登录排序
const openIDOAuthAuthSort = ref<any[]>(getLoginTypeOptions(OtherLoginKeys));

const loginSetting: AuthConfig = reactive({
  theme: 'full',
  title: '欢迎登录冠骋云PaaS平台',
  subtitle: '让数字化赋能客户成功！',
  logo: '',
  banner: '',
  loginModeConfigs: [],
  openIDOAuthConfigs: [],
  sortJson: '',
  defaultAuthType: LoginTypeEnum.ACCOUNT,
});

const cardLoginEnable = ref<boolean>(false);

// 系统登录
const loginModeConfig: Map<string, any> = reactive(
  new Map([
    [
      LoginTypeEnum.ACCOUNT,
      {
        address: '',
        authType: LoginTypeEnum.ACCOUNT,
        relationField: '',
        enabled: 0,
      },
    ],
    [
      LoginTypeEnum.DOMAIN_ACCOUNT,
      {
        address: '',
        authType: LoginTypeEnum.DOMAIN_ACCOUNT,
        relationField: '',
        domainSuffix: '',
        relationFieldName: '',
        enabled: 0,
      },
    ],
    [
      LoginTypeEnum.MOBILE,
      {
        smsServiceProvider: '', // 短信服务商
        smsKey: '', // 授权key
        smsKeySecret: '', // 授权secret
        smsTemplateCode: '', // 模板代码
        smsSignName: '', // 短信签名
        phoneNumb: '',
        smsSdkAppId: '',
        authType: LoginTypeEnum.MOBILE,
        enabled: 0,
      },
    ],
    [
      LoginTypeEnum.CARD,
      {
        address: '',
        authType: LoginTypeEnum.CARD,
        relationField: '',
        enabled: 0,
      },
    ],
    [
      LoginTypeEnum.DINGDING,
      {
        appId: '',
        authType: LoginTypeEnum.DINGDING,
        secret: '',
        redirectURL: '',
        enabled: 0,
      },
    ],
    [
      LoginTypeEnum.FEISHU,
      {
        appId: '',
        authType: LoginTypeEnum.FEISHU,
        secret: '',
        redirectURL: '',
        enabled: 0,
      },
    ],
    [
      LoginTypeEnum.QIYEWEIXIN,
      {
        appId: '',
        agentId: '',
        authType: LoginTypeEnum.QIYEWEIXIN,
        secret: '',
        redirectURL: '',
        enabled: 0,
        certFileName: '',
      },
    ],
    [
      LoginTypeEnum.MICROSOFT,
      {
        appId: '',
        agentId: '',
        authType: LoginTypeEnum.MICROSOFT,
        secret: '',
        redirectURL: '',
        enabled: 0,
        certFileName: '',
      },
    ],
  ]),
);

// 登录界面主题
const theme = ref([
  {
    imgUrl: 'login-password.png',
    value: 'full',
    label: '全屏模式',
  },
  {
    imgUrl: 'login.png',
    value: 'class',
    label: '经典模式',
  },
]);

export function useLoginSetting() {
  // 获取详情
  const loadLoginSetting = async () => {
    const res = await getPlatInfo({ configEnum: PlatformSettingEnum.LOGIN });
    console.log('res', res);
    await setLoginSetting(res);
  };

  const postLoginSetting = async () => {
    // 获取选中登录项
    const enableTypes = [...loginModeAuthTypes.value, ...openIDOAuthAuthTypes.value];
    loginModeConfig.forEach((item) => {
      item.enabled = enableTypes.includes(item.authType) ? 1 : 0;
    });
    loginSetting.loginModeConfigs = SystemLoginKeys.map((item) => {
      return loginModeConfig.get(item);
    });

    loginSetting.openIDOAuthConfigs = OtherLoginKeys.map((item) => {
      return loginModeConfig.get(item);
    });

    loginSetting.sortJson = JSON.stringify({
      [LoginSortTypeEnum.SYSTEM]: sysLoginSort.value.map((item) => item.id),
      [LoginSortTypeEnum.THIRD_PARTY]: openIDOAuthAuthSort.value.map((item) => item.id),
    });

    await postPlatLogin(loginSetting);
  };

  const setLoginSetting = async (config: SysConfigResponse | undefined) => {
    const cardLoginConfig = await getPlatCardLoginCfg();
    cardLoginEnable.value = !!cardLoginConfig?.enabled;
    console.log('config', config);
    if (config && config.value) {
      const value = JSON.parse(config.value);
      for (const k in value) {
        loginSetting[k] = value[k];
      }
      // 暂时隐藏不需要的登录项
      // if (has(value, 'sortJson') && !isEmpty(value.sortJson)) {
      //   const sortObj = JSON.parse(value.sortJson);

      //   if (has(sortObj, LoginSortTypeEnum.SYSTEM)) {
      //     console.log('SYSTEM', value);
      //     sysLoginSort.value = getLoginTypeOptions(sortObj[LoginSortTypeEnum.SYSTEM]);
      //   }
      //   if (has(sortObj, LoginSortTypeEnum.THIRD_PARTY)) {
      //     openIDOAuthAuthSort.value = getLoginTypeOptions(sortObj[LoginSortTypeEnum.THIRD_PARTY]);
      //   }
      // }
      loginSetting.loginModeConfigs?.forEach((item) => {
        loginModeConfig.set(item.authType!, { ...item, enabled: 0 });
      });

      const loginModeConfigs =
        loginSetting.loginModeConfigs
          ?.filter((item) => {
            return item.enabled;
          })
          .map((i) => {
            return i.authType as string;
          }) || [];

      // 默认选中密码登录
      loginModeConfigs.push(LoginTypeEnum.ACCOUNT);
      loginModeAuthTypes.value = [...new Set(loginModeConfigs)];
      if (!cardLoginEnable.value) {
        loginModeAuthTypes.value = loginModeAuthTypes.value.filter((t) => t !== LoginTypeEnum.CARD);
        sysLoginSort.value = sysLoginSort.value.filter((item) => item.id !== LoginTypeEnum.CARD);
      } else if (!sysLoginSort.value.some((item) => item.id === LoginTypeEnum.CARD)) {
        const cardOpt = getLoginTypeOptions([LoginTypeEnum.CARD])[0];
        const mobileIdx = sysLoginSort.value.findIndex((item) => item.id === LoginTypeEnum.MOBILE);
        if (mobileIdx >= 0) {
          sysLoginSort.value.splice(mobileIdx + 1, 0, cardOpt);
        } else {
          sysLoginSort.value.push(cardOpt);
        }
      }
      loginSetting.openIDOAuthConfigs?.forEach((item) => {
        loginModeConfig.set(item.authType!, { ...item, enabled: 0 });
      });
      openIDOAuthAuthTypes.value =
        loginSetting.openIDOAuthConfigs
          ?.filter((item) => {
            return item.enabled;
          })
          .map((i) => {
            return i.authType as string;
          }) || [];
    }
  };

  return {
    loginSetting,
    loadLoginSetting,
    postLoginSetting,
    setLoginSetting,
    theme,
    loginModeAuthTypes,
    openIDOAuthAuthTypes,
    sysLoginSort,
    openIDOAuthAuthSort,
    loginModeConfig,
  };
}
