/** 登录方式排序分类 */
export enum LoginSortTypeEnum {
  /** 系统登录 */
  SYSTEM = 'SYSTEM',
  /** 第三方登录 */
  THIRD_PARTY = 'THIRD_PARTY',
}

/** 登录类型 */
export enum LoginTypeEnum {
  /** 账号密码 */
  ACCOUNT = 'ACCOUNT',
  /** 域账号 */
  DOMAIN_ACCOUNT = 'DOMAIN_ACCOUNT',
  /** 手机号 */
  MOBILE = 'MOBILE',
  /** 刷卡登录 */
  CARD = 'CARD',
  /** 钉钉 */
  DINGDING = 'DINGDING',
  /** 飞书 */
  FEISHU = 'FEISHU',
  /** 企业微信 */
  QIYEWEIXIN = 'QIYEWEIXIN',
  /** 微软云 */
  MICROSOFT = 'MICROSOFT',
}

const loginTypeInfo = {
  [LoginTypeEnum.ACCOUNT]: {
    icon: 'icon-a-Accountnumber',
    color: '#0E81EC',
  },
  [LoginTypeEnum.DOMAIN_ACCOUNT]: {
    icon: 'icon-a-Domainaccount',
    color: '#FFAB06',
  },
  [LoginTypeEnum.MOBILE]: {
    icon: 'icon-a-Cellphone',
    color: '#6A70FE',
  },
  [LoginTypeEnum.CARD]: {
    icon: 'icon-shuakadenglu',
    color: '#6A70FE',
  },
  [LoginTypeEnum.DINGDING]: {
    icon: 'DingdingIcon',
  },
  [LoginTypeEnum.FEISHU]: {
    icon: 'FeishuIcon',
  },
  [LoginTypeEnum.QIYEWEIXIN]: {
    icon: 'QiyeweixinIcon',
  },
  [LoginTypeEnum.MICROSOFT]: {
    icon: 'MicrosoftIcon',
  },
};

export const SystemLoginKeys = [
  LoginTypeEnum.ACCOUNT,
  LoginTypeEnum.DOMAIN_ACCOUNT,
  LoginTypeEnum.MOBILE,
  LoginTypeEnum.CARD,
];

export const OtherLoginKeys = [
  LoginTypeEnum.DINGDING,
  LoginTypeEnum.FEISHU,
  LoginTypeEnum.QIYEWEIXIN,
  LoginTypeEnum.MICROSOFT,
];

export const getLoginTypeOptions = (keys) => {
  if (!keys) {
    return [];
  }

  return keys.map((key) => {
    return {
      id: key,
      label: key,
      value: key,
      ...loginTypeInfo[key],
    };
  });
};
