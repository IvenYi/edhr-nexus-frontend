import { useI18n } from '/@/hooks/web/useI18n';

import {
  ModelTypeEnum,
  PageTypeEnum,
  PrintTypeEnum,
  ScriptTypeEnum,
  ProcessTypeEnum,
  CategoryEnum,
} from '../enum/index';

const { t } = useI18n();

export const ModelTypeOptions = [
  {
    code: ModelTypeEnum.ENTITY,
    label: '实体',
    icon: 'icon-shitimoxing',
  },
  {
    code: ModelTypeEnum.ENUM,
    label: '枚举',
    icon: 'icon-meiju',
  },
  {
    code: ModelTypeEnum.VIEW,
    label: '视图',
    icon: 'icon-a-icon_shitumoxing16-copy',
  },
  {
    code: ModelTypeEnum.DATA,
    label: '数据',
    icon: 'icon-shujumoxing',
  },
  // ! 先隐藏
  // {
  //   code: ModelTypeEnum.VIRTUAL,
  //   label: '虚拟',
  //   icon: 'icon-xuni',
  // },

  // {
  //   code: ModelTypeEnum.SQL,
  //   label: 'SQL',
  //   icon: 'icon-SQL',
  // },
];

export const PageTypeOptions = [
  {
    code: PageTypeEnum.WEB,
    label: 'Web',
    icon: 'icon gct-iconfont icon-yemiansheji-Web',
  },
  {
    code: PageTypeEnum.MOBILE,
    label: 'PDA',
    icon: 'icon gct-iconfont icon-yemiansheji-PDA',
  },
  {
    code: PageTypeEnum.PAD,
    label: 'Pad',
    icon: 'icon gct-iconfont icon-yemiansheji-Pad',
  },
  // ! 先隐藏
  // {
  //   code: PageTypeEnum.STATISTICS,
  //   label: '统计',
  //   icon: 'icon-Statistics',
  // },
];

export const LogicTypeOptions = [
  {
    code: ScriptTypeEnum.DEFAULT,
    label: '脚本',
    icon: 'icon-SCRIPT',
  },
  {
    code: ScriptTypeEnum.ORCHESTRATION,
    label: '编排',
    icon: 'icon-arrange',
  },
  {
    code: ScriptTypeEnum.GLOBAL_METHOD,
    label: '方法',
    icon: 'icon-fangfa',
  },
];

export const PrintTypeOptions = [
  {
    code: PrintTypeEnum.LABEL,
    label: '标签',
    icon: 'icon-motaikuang1',
  },
  {
    code: PrintTypeEnum.RECEIPT,
    label: '单据',
    icon: 'icon-jichuxinxi',
  },
];

export const ProcessTypeOptions = [
  // {
  //   code: ProcessTypeEnum.BUSINESS,
  //   label: '业务流',
  //   icon: 'icon-yewuliu1',
  // },
  {
    code: ProcessTypeEnum.APPROVAL,
    label: '审批流',
    icon: 'icon-shenpi1',
  },
];
// ! 虚拟、视图、SQL、统计、编排 暂时还没开发 所以先用空字符串
/**
 * 模块key的前缀枚举
 */
export const ModuleKeyPrefix = {
  /** 实体 */
  [ModelTypeEnum.ENTITY]: 'em',
  /** 枚举 */
  [ModelTypeEnum.ENUM]: 'enu',
  /** 虚拟 */
  [ModelTypeEnum.VIRTUAL]: '',
  /** 视图 */
  [ModelTypeEnum.VIEW]: '',
  /** SQL */
  [ModelTypeEnum.SQL]: '',
  /** WEB */
  [PageTypeEnum.WEB]: 'web',
  /** MOBILE */
  [PageTypeEnum.MOBILE]: 'mobile',
  /** PAD */
  [PageTypeEnum.PAD]: 'pad',
  /** 统计 */
  [PageTypeEnum.STATISTICS]: '',
  /** 脚本 */
  [ScriptTypeEnum.DEFAULT]: 'script',
  /** 编排 */
  [ScriptTypeEnum.ORCHESTRATION]: 'so',
  [ProcessTypeEnum.APPROVAL]: 'process',
  /** DATA */
  [ModelTypeEnum.DATA]: 'data',
};

export const moduleTabLabelEnum = {
  [CategoryEnum.ENTITY]: t('sys.newModel'),
  [CategoryEnum.ENUM]: t('sys.model.newEnumeration'),
  [CategoryEnum.WEB]: t('sys.newWebPage'),
  [CategoryEnum.MOBILE]: t('sys.newPdaPage'),
  [CategoryEnum.PAD]: t('sys.newPadPage'),
  [CategoryEnum.DEFAULT]: t('sys.appDesigner.newScript'),
  [CategoryEnum.ORCHESTRATION]: t('sys.newOrchestrate'),
  [CategoryEnum.LABEL]: t('sys.newLabel'),
  [CategoryEnum.RECEIPT]: t('sys.appDesigner.printDesign.receipt'),
  [CategoryEnum.APPROVAL]: t('sys.newApproval'),
  [CategoryEnum.GLOBAL_METHOD]: t('sys.newPublicFunction'),
  [CategoryEnum.VIEW]: t('sys.newView'),
  [CategoryEnum.DATA]: t('sys.newDataModule'),
  [CategoryEnum.ONLINE_FORM]: t('sys.newOnlineForm'),
  [CategoryEnum.EDHR]: t('sys.newEDHR'),
};

export const moduleTabSearchEnum = {
  [CategoryEnum.ENTITY]: t('sys.searchModelTip'),
  [CategoryEnum.ENUM]: t('sys.searchModelTip'),
  [CategoryEnum.WEB]: t('sys.searchPage'),
  [CategoryEnum.MOBILE]: t('sys.searchPage'),
  [CategoryEnum.PAD]: t('sys.searchPage'),
  [CategoryEnum.DEFAULT]: t('sys.searchScript'),
  [CategoryEnum.ORCHESTRATION]: t('sys.searchOrchTip'),
  [CategoryEnum.LABEL]: t('sys.searchLabelTip'),
  [CategoryEnum.RECEIPT]: t('sys.searchReceiptTip'),
  [CategoryEnum.APPROVAL]: t('sys.searchFlow'),
  [CategoryEnum.GLOBAL_METHOD]: t('sys.searchFunc'),
  [CategoryEnum.VIEW]: t('sys.searchModelTip'),
  [CategoryEnum.DATA]: t('sys.searchModelTip'),
};
