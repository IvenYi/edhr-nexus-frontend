import { drawerSelectorInstance, ListType, SearchData, Option } from '../../../drawerSelector';
import { FIELD_TYPE } from '@/enums/appEnum';
import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveQueryRefChainDataByModelCategory,
  getModelComprehensiveEnumInfoByModelCategory,
  postModelComprehensiveQueryRefDataByIdsByModelCategory,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import {
  getDesignerCommonGetCanBeUsedOrg,
  getDesignerCommonGetCanBeUsedOrgUser,
  getDesignerCommonTableEntityModelList,
  getDesignerCommonListUserByIds,
} from '/@/apis/gct-apaas/DesignerCommonController';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import { transSelectData, transformData } from '/@page-designer/components/widgets/hooks/utils';
import {
  useQueryfilter,
  getQueryDateByKeyWord,
} from '/@page-designer/components/widgets/hooks/listhook';
import { merge } from 'lodash-es';
import { FieldConfigType, ReturnData } from './types';
/**模型关联 */
export async function getRefList(
  fieldConfig: FieldConfigType,
  queryData: SearchData,
  config: any = {},
): Promise<ReturnData> {
  const { searchField } = config;
  const { modelKey, fieldKey, refModelKey, customApi } = fieldConfig;
  const { searchValue, pageNumber, pageSize, query = {} } = queryData || {};
  const _API = customApi?.value || postModelDataQueryRefData;
  const {
    data = [],
    totalCount,
    dict = {},
    options = {},
  } = (await _API(
    merge(
      {},
      {
        modelKey,
        fieldKey,
        refModelKey,
        pageSize: pageSize || 30,
        pageNo: pageNumber || 1,
        ...query,
      },
      { query: getQueryDateByKeyWord({ searchField, keyword: searchValue }) },
    ),
  )) || {};
  //deleted_ 表示被软删除的数据
  //_dict_item 表示翻译后的数据源
  const valueList = (data ?? []).map((i) => {
    return {
      label: i.__LABEL__ as string,
      value: (i.id_ || i.id) as stirng,
      _protoValue: transformData(i, dict),
    };
  });
  return { options: valueList, total: totalCount };
}

/**更具ids 查询数据列表 */
export async function getRefListByIds(
  fieldConfig: FieldConfigType,
  ids: string[],
): Promise<Option[]> {
  const { modelKey, fieldKey, refModelKey, modelCategory, customApi } = fieldConfig;
  const _API = customApi?.value || postModelComprehensiveQueryRefDataByIdsByModelCategory;
  const { data = [] } =
    (await _API(
      {
        modelCategory: modelCategory || EntityModelCategoryEnum.ENTITY,
      },
      {
        fieldKey, // 字段 key
        ids, // id 集合
        includeDeleted: true, // 包含删除的数据
        modelKey, // 模型 key
        refModelKey, // 引用的模型key
      },
    )) || ({} as any);
  //deleted_ 表示被软删除的数据
  return data
    ?.map((i) => {
      return { disabled: !!i.deleted_, label: i.__LABEL__, value: i.id_ || i.id, _item: i };
    })
    .filter((i) => ids.includes(i.value));
}
