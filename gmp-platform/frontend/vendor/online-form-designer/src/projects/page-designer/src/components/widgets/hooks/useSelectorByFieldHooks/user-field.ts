import { SearchData, Option } from '../../../drawerSelector';

import {
  getDesignerCommonGetCanBeUsedOrgUser,
  getDesignerCommonListUserByIds,
} from '/@/apis/gct-apaas/DesignerCommonController';
import { FieldConfigType, ReturnData } from './types';

/**
 * 获取人员列表
 * @param fieldConfig - 字段配置
 * @param queryData - 查询数据
 * @returns 返回人员列表和总数
 */
export async function getUserList(
  fieldConfig: FieldConfigType,
  queryData: SearchData,
): Promise<ReturnData> {
  const { modelKey, fieldKey, customApi } = fieldConfig;
  const { searchValue, pageNumber, pageSize, query = {}, ignoreCase = 0 } = queryData;
  const _API = customApi?.value || getDesignerCommonGetCanBeUsedOrgUser;
  const res =
    (await _API({
      modelKey,
      fieldKey,
      keyword: searchValue,
      pageNo: pageNumber || 1,
      pageSize: pageSize || 30,
      ignoreCase: searchValue ? ignoreCase : undefined,
      ...query.exp,
      ...query.query,
    })) || {};
  const { data = [], totalCount } = res;
  const valueList =
    data?.map((i) => {
      return { label: i.__LABEL__!, value: i.id!, _protoValue: i };
    }) || [];
  return { options: valueList, total: totalCount };
}

/**
 * 根据ids查询人员列表
 * @param fieldConfig - 字段配置
 * @param ids - 人员ID集合
 * @returns 返回人员选项列表
 */
export async function getUserListByIds(
  fieldConfig: FieldConfigType,
  ids: string[],
): Promise<Option[]> {
  const { customApi, modelKey, fieldKey } = fieldConfig;
  const _API = customApi?.value || getDesignerCommonListUserByIds;
  const res = await _API({ ids: ids.join(','), modelKey, fieldKey });
  const valueList = (res.data || res || []).map((i) => {
    return { label: i.__LABEL__!, value: i.id!, _protoValue: i };
  });
  return valueList;
}
