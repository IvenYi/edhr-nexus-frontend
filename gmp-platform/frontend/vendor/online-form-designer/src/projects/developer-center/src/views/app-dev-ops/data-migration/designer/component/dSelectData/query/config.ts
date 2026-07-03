import { FIELD_TYPE } from '@/enums/appEnum';
import { SearchComponents, ListTreeSearchTypeEnum } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import {
  getDesignerCommonGetCanBeUsedOrg,
  getDesignerCommonGetCanBeUsedOrgUser,
  getDesignerCommonTableEntityModelList,
} from '/@/apis/gct-apaas/DesignerCommonController';
import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveQueryRefChainDataByModelCategory,
  getModelComprehensiveEnumInfoByModelCategory,
  postModelComprehensiveQueryRefDataByIdsByModelCategory,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import { inject, provide, ref, reactive, nextTick } from 'vue';

export const searchCmpKeyMap = {
  [FIELD_TYPE.TEXT]: {
    searchCmpKey: SearchComponents.SearchInput,
    ope: SEARCH_SEVICE.LIKE,
  },
  [FIELD_TYPE.LONG_TEXT]: {
    searchCmpKey: SearchComponents.SearchInput,
    ope: SEARCH_SEVICE.LIKE,
  },
  [FIELD_TYPE.PRIMARY_KEY]: {
    searchCmpKey: SearchComponents.SearchInput,
    ope: SEARCH_SEVICE.LIKE,
  },
  [FIELD_TYPE.DATE]: {
    searchCmpKey: SearchComponents.SearchDate,
    ope: SEARCH_SEVICE.RANGE,
    dateType: 'YYYY-MM-DD',
  },
  [FIELD_TYPE.DATE_TIME]: {
    searchCmpKey: SearchComponents.SearchDateTime,
    ope: SEARCH_SEVICE.RANGE,
    dateType: 'YYYY-MM-DD HH:mm:ss',
  },
  [FIELD_TYPE.TIME]: {
    searchCmpKey: SearchComponents.SearchTime,
    ope: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.BOOLEAN]: {
    searchCmpKey: SearchComponents.SearchSwitch,
    ope: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.ENUM]: {
    searchCmpKey: SearchComponents.SearchSelect,
    ope: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.ENUM_MULTI]: {
    searchCmpKey: SearchComponents.SearchSelect,
    ope: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.ORG_MULTI]: {
    searchCmpKey: SearchComponents.SearchSelect,
    ope: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.USER_MULTI]: {
    searchCmpKey: SearchComponents.SearchUserSelect,
    ope: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.ORG]: {
    searchCmpKey: SearchComponents.SearchSelect,
    ope: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.USER]: {
    searchCmpKey: SearchComponents.SearchUserSelect,
    ope: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.REF_MULTI]: {
    searchCmpKey: SearchComponents.SearchSelect,
    ope: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.REF]: {
    searchCmpKey: SearchComponents.SearchSelect,
    ope: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.RDO_REF]: {
    searchCmpKey: SearchComponents.SearchRdoSelect,
    ope: SEARCH_SEVICE.IN,
  },
};

const FIELD_MAP = {
  [FIELD_TYPE.ENUM]: {
    multiple: false,
    http: getEnumList,
    api: getModelComprehensiveEnumInfoByModelCategory,
  },
  [FIELD_TYPE.ENUM_MULTI]: {
    multiple: true,
    http: getEnumList,
    api: getModelComprehensiveEnumInfoByModelCategory,
  },
  [FIELD_TYPE.RDO_REF]: {
    multiple: false,
    http: getRdoRefList,
    api: postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  },
  [FIELD_TYPE.REF]: {
    multiple: false,
    http: getRefList,
    api: postModelDataQueryRefData,
  },
  [FIELD_TYPE.REF_MULTI]: {
    multiple: true,
    http: getRefList,
    api: postModelDataQueryRefData,
  },
  [FIELD_TYPE.USER]: {
    multiple: false,
    http: getUserList,
    api: getDesignerCommonGetCanBeUsedOrgUser,
  },
  [FIELD_TYPE.USER_MULTI]: {
    multiple: true,
    http: getUserList,
    api: getDesignerCommonGetCanBeUsedOrgUser,
  },
  [FIELD_TYPE.ORG]: {
    multiple: false,
    http: getDeptList,
    api: getDesignerCommonGetCanBeUsedOrg,
  },
  [FIELD_TYPE.ORG_MULTI]: {
    multiple: true,
    http: getDeptList,
    api: getDesignerCommonGetCanBeUsedOrg,
  },
  // [FIELD_TYPE.BOOLEAN]: {
  //   multiple: false,
  //   http: getBooleanList,
  // },
};
export interface RetrunList {
  label: string;
  value: number | string | boolean;
  _item: object;
}
type HttpReturnValue = Promise<{
  valueList: RetrunList[];
  labelList?: RetrunList[];
  sourceData?: any[];
  finished?: boolean;
}>;
/**
 * 获取部门列表
 */
async function getDeptList(API, config): HttpReturnValue {
  const data = (await API(config)) || [];
  data?.forEach((i) => {
    const isRoot = !data.find((o) => o.id === i.parentId);
    isRoot && (i.parentId = 'ROOT');
  });
  const labelList =
    data?.map((i) => {
      return { label: i.name!, value: i.id!, _item: i };
    }) || [];

  return { valueList: labelList };
}
/**关联选择根据id 查询 */
async function refOptionsByIds(arg) {
  const { modelKey, fieldKey, ids = [], bindModelKey, modelCategory } = arg;
  const { data = [] } =
    (await postModelComprehensiveQueryRefDataByIdsByModelCategory(
      {
        modelCategory: modelCategory || EntityModelCategoryEnum.ENTITY,
      },
      {
        fieldKey, // 字段 key
        ids, // id 集合
        includeDeleted: true, // 包含删除的数据
        modelKey, // 模型 key
        refModelKey: bindModelKey, // 引用的模型key
      },
    )) || ({} as any);
  //deleted_ 表示被软删除的数据
  return data?.map((i) => {
    return { disabled: !!i.deleted_, label: i.__LABEL__, value: i.id_ || i.id, _item: i };
  });
}

/**
 * 获取枚举列表
 * @returns
 */

async function getEnumList(API, config, { modelKey, fieldKey }): HttpReturnValue {
  const data =
    (await API(
      { modelCategory: EntityModelCategoryEnum.ENTITY },
      {
        modelKey,
        fieldKey,
      },
      config,
    )) || {};
  const valueList =
    data?.map((i) => {
      return { label: i.text!, value: i.value!, _item: i };
    }) || [];
  return { valueList };
}

/**
 * 获取Rdo模型列表  查询组件专用
 * @returns
 */
async function getRdoRefList(API, { bindModelKey, keyword, pageNo }): HttpReturnValue {
  const {
    data = [],
    pageSize,
    pageNo: pageNum,
    totalCount,
  } = (await API(
    {
      bsKey: 'rdoListByPage',
      modelKey: bindModelKey,
      modelCategory: EntityModelCategoryEnum.ENTITY,
    },
    { pageSize: 10, pageNo: pageNo || 1 },
    { keyword },
  )) || {};
  const valueList = data.map((i) => {
    return { label: i.name_, value: i.id_, _item: {} };
  });
  return { valueList, finished: pageNum * pageSize >= totalCount };
}

/**
 * 获取模型列表
 * @returns
 */
async function getRefList(
  API,
  config,
  {
    modelKey,
    fieldKey,
    queryData = {},
    pageNo,
    pageSize,
    exp,
    includeDeleted = false,
    bindModelKey,
  },
): HttpReturnValue {
  const { data = [], totalPage } =
    (await API(
      {
        exp,
        query: { ...queryData },
        modelKey,
        fieldKey,
        pageSize: pageSize || 30,
        pageNo: pageNo || 1,
        includeDeleted,
        refModelKey: bindModelKey,
      },
      config,
    )) || {};
  //deleted_ 表示被软删除的数据
  const valueList = data?.map((i) => {
    return { disabled: !!i.deleted_, label: i.__LABEL__, value: i.id_ || i.id, _item: i };
  });
  return { valueList, finished: totalPage && pageNo === totalPage };
}

/**
 * 获取人员列表
 * @returns
 */
async function getUserList(
  API,
  config,
  { modelKey, fieldKey, keyword, orgIds, pageNo, pageSize },
): HttpReturnValue {
  const res =
    (await API(
      {
        modelKey,
        fieldKey,
        keyword,
        orgIds,
        pageNo,
        pageSize: pageSize || 999,
      },
      config,
    )) || {};
  const { data = [] } = res;
  const valueList = data.map((i) => {
    return { label: i.__LABEL__!, value: i.id!, _item: i };
  });
  return { valueList, finished: res.pageNo * res.pageSize >= res.totalCount };
}

/**
 *获取tree模型列表
 */
async function getRefTreeList(
  API,
  config,
  {
    modelKey,
    fieldKey,
    queryData = {},
    searchType = ListTreeSearchTypeEnum.LEVEL,
    parent_id_,
    ids = [],
    exp,
  },
) {
  const query = {};
  if (ids?.length) {
    query['id_.in'] = ids;
    searchType = ListTreeSearchTypeEnum.SEARCH;
  }
  if (Object.keys(queryData)?.length) {
    searchType = ListTreeSearchTypeEnum.SEARCH;
  }
  if (searchType === ListTreeSearchTypeEnum.LEVEL) {
    query['level_.le'] = 2;
  } else if (searchType === ListTreeSearchTypeEnum.CHILDREN) {
    query['parent_id_.eq'] = parent_id_;
  }

  const { data = [] } =
    (await API(
      {
        searchType,
        exp,
        query: { ...query, ...queryData },
        modelKey,
        fieldKey,
      },
      config,
    )) || {};

  const valueList =
    data?.map((i) => {
      if (i.__NON_LEAF__ === undefined) {
        i.__NON_LEAF__ = data.some((k) => k.parent_id_ === i.id_);
      }
      return {
        label: i.__LABEL__,
        value: i.id_,
        full_path_: i.full_path_,
        _item: i,
        id: i.id_,
        pId: i.parent_id_,
        isLeaf: !i.__NON_LEAF__,
      };
    }) || [];
  return { valueList };
}
/**根据条件识别调用的数据源函数 */
function getOptionsFunction({ http, api }: any, config, isTree) {
  // console.log(http, api)
  const optionsFun = isTree ? getRefTreeList : http;
  if (api) {
    return optionsFun.bind(null, api, config);
  } else {
    return optionsFun;
  }
}
/**
 * 关联模型，关联枚举,人员 部门
 * @param widgetProps
 * @returns
 */
export const useAsyncOptions = (fieldType: keyof typeof FIELD_MAP, configByHeaders, isTree) => {
  console.log(fieldType, configByHeaders, FIELD_MAP);
  const configdata = FIELD_MAP[fieldType] ?? {};
  const multiple = configdata.multiple;
  const options = ref<RetrunList[]>([]);
  console.log(configdata);
  const getAsyncOptionsByApis = (): any => getOptionsFunction(configdata, configByHeaders, isTree);
  const refQueryData = reactive({
    pageNo: 1,
    arg: {},
  });

  /**
   * 异步获取远程接口
   */
  async function getAsyncOptions(arg: any = {}) {
    console.log(arg);
    const apis = getAsyncOptionsByApis();
    if (!apis) return [];
    refQueryData.arg = arg;
    refQueryData.pageNo = 1;
    //customApi 自定义数据源不可控不支持缓存
    const res = await apis(arg);
    const { valueList = [] } = res;
    if (isTree) {
      /**tree下面的懒加载模式 */
      options.value.push(...valueList);
    } else {
      options.value = [...valueList];
    }
    return res;
  }

  /**
   * 异步获取远程接口下一页
   */
  async function getNextOptions() {
    const apis = getAsyncOptionsByApis();
    if (!apis) return [];
    refQueryData.pageNo++;
    const { valueList, finished } = await apis({
      ...refQueryData.arg,
      pageNo: refQueryData.pageNo,
    });
    const optionsList = options.value;
    valueList.forEach((i) => {
      if (!optionsList.find((j) => j.value === i.value)) {
        options.value.push(i);
      }
    });
    return finished;
  }
  /**
   * ids补充查询
   */
  async function getRefOptionsByIds(arg) {
    const apis = getAsyncOptionsByApis();
    if (!apis) return [];
    if (isTree) {
      const { valueList } = await apis(...arg);
      options.value = [...valueList];
    } else {
      const valueList = await refOptionsByIds(arg);
      const optionsList = options.value;
      valueList?.forEach((i) => {
        if (!optionsList.find((j) => j.value === i.value)) {
          options.value.push(i);
        }
      });
    }
  }
  return {
    getRefOptionsByIds,
    getAsyncOptions,
    options,
    multiple,
    getNextOptions,
  };
};

const isArrayOpe = [
  SEARCH_SEVICE.CONTAINALL,
  SEARCH_SEVICE.CONTAINANY,
  SEARCH_SEVICE.IN,
  SEARCH_SEVICE.NOTIN,
];
function getMultipleChoiceToArray(value, ope: SEARCH_SEVICE) {
  if (isArrayOpe.indexOf(ope) > -1 && typeof value === 'string') {
    return value.split(',');
  } else {
    return value;
  }
}
/**查询组件body转化为算子 */
export function useGetBodyBySearch(formState, cacheColumns) {
  /**
   * 转化为post请求的格式
   * @param fieldWidget
   * @param state
   */
  const body = {};
  cacheColumns.forEach((i) => {
    const field = i.key;
    const ope = i._ope;
    const value = formState[field];
    if (value !== null && value !== undefined) {
      const key = ope ? `${field}.${ope}` : field;
      body[key] = getMultipleChoiceToArray(value, ope);
    }
  });
  return body;
}
