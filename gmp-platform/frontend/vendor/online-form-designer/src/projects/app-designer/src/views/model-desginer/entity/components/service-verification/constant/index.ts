import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

/**
 * 状态
 * @alias ENABLE    启用
 * @alias UN_ENABLE 禁用
 */
export enum ServiceVerificationStatusEnum {
  /** 1：启用 */
  ENABLE = 1,
  /** 0：禁用 */
  UN_ENABLE = 0,
}

/** 规则类型 */
export enum RuleTypeEnum {
  /** 规则表达式 */
  RULE_EXP = 'exp',
  /** 脚本表达式 */
  RULE_SCRIPT = 'script',
}

/** 规则类型对应中文翻译 */
export const Ch_RuleType = {
  [RuleTypeEnum.RULE_EXP]: t('sys.appDesigner.expression'),
  [RuleTypeEnum.RULE_SCRIPT]: t('sys.model.serviceScript'),
};

/** 是否内置 */
export enum SysBuiltinTypeEnum {
  /** 1：内置 */
  BUILT_IN = 1,
  /** 0：自定义 */
  CUSTOM = 0,
}

/** 是否内置对应中文翻译 */
export const Ch_SysBuiltinType = {
  [SysBuiltinTypeEnum.BUILT_IN]: t('sys.appDesigner.system'),
  [SysBuiltinTypeEnum.CUSTOM]: t('sys.appDesigner.custom'),
}