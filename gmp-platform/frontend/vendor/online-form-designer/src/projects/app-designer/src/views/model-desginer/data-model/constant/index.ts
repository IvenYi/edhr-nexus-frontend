import { useI18n } from '/@/hooks/web/useI18n';
import { FIELD_TYPE } from '@/enums/appEnum';
import type { RadioGroupProps } from 'ant-design-vue';

const { t } = useI18n();

/** 是否唯一配置参数类型 */
export const enum UniqueConstraintType {
  /** 无 */
  NONE = 'NONE',
  /** 全局唯一 */
  GLOBAL = 'GLOBAL',
  /** 同级唯一 */
  LEVEL = 'LEVEL',
  /** 逻辑唯一 */
  LOGIC = 'LOGIC',
}

export const uniqueConstraintOptions: RadioGroupProps['options'] = [
  {
    label: t('sys.model.uniqueLevel'),
    value: UniqueConstraintType.LEVEL,
  },
  {
    label: t('sys.model.uniqueGlobal'),
    value: UniqueConstraintType.GLOBAL,
  },
  // 暂时后端还没开发
  // {
  //   label: t('sys.model.uniqueLogic'),
  //   value: UniqueConstraintType.LOGIC,
  // },
];

export const getChUniqueConstraint = (uniqueConstraint, supportTreeVal, fieldType) => {
  if (!uniqueConstraint || uniqueConstraint.type === UniqueConstraintType.NONE) {
    return t('sys.false');
  }

  const res: any = uniqueConstraintOptions.find(
    (item: any) => item.value === uniqueConstraint.type,
  );

  if (res) {
    return res.label;
  }
  return t('sys.false');
};
