import { useI18n } from '/@/hooks/web/useI18n';
import { UniqueConstraintType } from '@/enums/appEnum';
import type { RadioGroupProps } from 'ant-design-vue';
import { RecordNoGenerateEnum } from '@gct/runtime';

const { t } = useI18n();

export const generateRecordNoOptions: RadioGroupProps['options'] = [
  {
    label: '手动输入',
    value: RecordNoGenerateEnum.HANDLE,
  },
  {
    label: '序列号规则',
    value: RecordNoGenerateEnum.SN_RULE,
  },
];

export const refRecordNoOptions: RadioGroupProps['options'] = [
  {
    label: '唯一标识',
    value: 0,
  },
  {
    label: '链接标识',
    value: 1,
  },
];

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
