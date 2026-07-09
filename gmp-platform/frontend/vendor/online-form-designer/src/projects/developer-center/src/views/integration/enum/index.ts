export enum MessageTemplateEnum {
  EMAIL = 'email',
  DING_TALK = 'dingtalk',
  WX_WORK = 'wecom',
  FEISHU = 'feishu',
}

export const MessageTemplateOptions = [
  {
    value: MessageTemplateEnum.EMAIL,
    i18n: 'sys.email',
    dataKey: 'emailCount',
    icon: 'mail',
    prefix: 'mail_',
  },
  {
    value: MessageTemplateEnum.DING_TALK,
    i18n: 'sys.dingtalk',
    dataKey: 'dingTalkCount',
    icon: 'dingtalk',
    prefix: 'ding_',
  },
  {
    value: MessageTemplateEnum.WX_WORK,
    i18n: 'sys.workwx',
    dataKey: 'wxWorkCount',
    icon: 'workwx',
    prefix: 'qwork_',
  },
  {
    value: MessageTemplateEnum.FEISHU,
    i18n: 'sys.feishu',
    dataKey: 'feishuCount',
    icon: 'feishu',
    prefix: 'lark_',
  },
];

export enum ServiceTypeEnum {
  IMAP = 'IMAP',
  SMTP = 'SMTP',
  POP3 = 'POP3',
}

export enum CardDropdownEnum {
  Test,
  Delete,
}

export enum PrintResourceEnum {
  CLIENT_PRINT = 'CLIENT_PRINT',
  INTERNET_PRINT = 'INTERNET_PRINT',
}

export enum PrintTypeEnum {
  Zpl = 'zpl',
  String = 'string',
  Png = 'png',
  Btw = 'btw',
}

export enum DataSourceEnv {
  Dev = 'dev',
  Test = 'test',
  Prod = 'prod',
}

enum DataBaseType {
  mysql = 'mysql',
  postgres = 'postgres',
  oracle = 'oracle',
  sqlserver = 'sqlserver',
}

export const DataSourceEnvOptions = Object.keys(DataBaseType).map((key) => {
  return {
    key,
    i18n: `sys.integration.db.${key}`,
  };
});

export enum ApiManageEnum {
  API_GROUP = 'API_GROUP',
  KEY_MANAGEMENT = 'KEY_MANAGEMENT',
  CALL_LOG = 'CALL_LOG',
}

export const envOptions = Object.values(DataSourceEnv).map((key) => ({
  key,
  i18n: `sys.integration.env.${key}`,
}));

export enum typeEnum {
  String = 'sys.text',
  Integer = 'sys.component.dataConnection.modelField.integer',
  Long = 'sys.component.dataConnection.modelField.long',
  Float = 'sys.component.dataConnection.modelField.double',
  Boolean = 'sys.component.dataConnection.modelField.boolean',
  Date = 'sys.component.dataConnection.modelField.date',
  Array = 'sys.developer.devive.arrayMapping',
}
