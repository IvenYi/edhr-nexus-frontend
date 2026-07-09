import { useI18n } from '/@/hooks/web/useI18n';
import { MaterialStatusEnum } from './enum';

type OptionType = 'all' | 'lot&sn' | 'edhr';

interface UseStatusOptionParams {
  /** 类型，控制取值场景 */
  type?: OptionType;
}

export function useMaterialStatus() {
  const { t } = useI18n();

  const allValues = Object.values(MaterialStatusEnum);

  const presets: Record<OptionType, () => MaterialStatusEnum[]> = {
    all: () => allValues,
    'lot&sn': () => [MaterialStatusEnum.LOT, MaterialStatusEnum.SN],
    edhr: () => [
      MaterialStatusEnum.DHR,
      MaterialStatusEnum.FORM,
      MaterialStatusEnum.TXN,
      MaterialStatusEnum.PRODUCT_RELEASE,
      MaterialStatusEnum.REWORK,
      MaterialStatusEnum.NOTEBOOK,
    ],
  };

  function getStatusOptions(params: UseStatusOptionParams = {}) {
    const { type = 'all' } = params;

    const values = presets[type]();

    return values.map((value) => ({
      value,
      label: t('sys.edhr.materialStatus.' + value),
    }));
  }

  return {
    getStatusOptions,
  };
}

export function shouldShowFormSource(record: any): boolean {
  return Boolean(
    record?.edhrInstanceId && record?.businessType !== MaterialStatusEnum.PRODUCT_RELEASE,
  );
}
