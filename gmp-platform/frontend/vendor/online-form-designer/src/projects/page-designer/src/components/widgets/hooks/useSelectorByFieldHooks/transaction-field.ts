import { getDesignerCommonTableEntityModelList } from '/@/apis/gct-apaas/DesignerCommonController';

import { FieldConfigType, ReturnData } from './types';

export async function getTransactionList(fieldConfig: FieldConfigType): Promise<ReturnData> {
  const { modelKey, fieldKey, modelCategory, customApi, customMenuFilter } = fieldConfig;

  const arr = await getDesignerCommonTableEntityModelList({
    type: 'TRANSACTION',
  });
  const options = (arr ?? []).map((item) => {
    return {
      label: item.name ?? '',
      value: item.key ?? '',
      _protoValue: item,
    };
  });
  return {
    options: options.filter((p) => {
      return customMenuFilter && !customApi?.value ? customMenuFilter.includes(p.value) : p;
    }),
  };
}
