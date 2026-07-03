import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

/** 是否内置 */
export enum FunctionTypeEnum {
  /** 1：内置 */
  BUILT_IN = 'SYS_BUILTIN',
}

/** 是否内置对应中文翻译 */
export const Ch_FunctionType = {
  [FunctionTypeEnum.BUILT_IN]: t('sys.model.functionSysBuiltin'),
};
