import {
  getModelComprehensiveEnumInfoByModelCategory,
  postModelComprehensiveQueryRefDataByIdsByModelCategory,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';

import { FieldConfigType, ReturnData } from './types';
/**关联枚举 */
export async function getEnumList(fieldConfig: FieldConfigType): Promise<ReturnData> {
  const { modelKey, fieldKey, modelCategory, customApi, customMenuFilter } = fieldConfig;
  const _API = customApi?.value || getModelComprehensiveEnumInfoByModelCategory;
  const data =
    (await _API(
      { modelCategory: modelCategory || EntityModelCategoryEnum.ENTITY },
      {
        modelKey,
        fieldKey,
      },
    )) || {};
  return {
    options: data
      .map((i) => {
        return {
          label: i.text!,
          value: i.value!,
          _protoValue: i,
          icon: i.icon,
          iconColor: i.iconColor,
          textColor: i.textColor,
        };
      })
      .filter((p) => {
        return customMenuFilter && !customApi?.value ? customMenuFilter.includes(p.value) : p;
      }),
  };
}
