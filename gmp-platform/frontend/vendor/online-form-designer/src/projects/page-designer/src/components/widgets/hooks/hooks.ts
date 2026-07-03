import { inject, provide, ref, reactive, nextTick } from 'vue';
import type { InjectionKey } from 'vue';
import { Events } from '/@web-render/render/Event/baseEvent';
import { FIELD_TYPE } from '@/enums/appEnum';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
import { ListTreeSearchTypeEnum, SearchComponents } from '/@page-designer/enum';
import { pick, cloneDeep } from 'lodash-es';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import {
  getDesignerCommonGetCanBeUsedOrg,
  getDesignerCommonGetCanBeUsedOrgUser,
  getDesignerCommonTableEntityModelList,
} from '/@/apis/gct-apaas/DesignerCommonController';
import { cacheAdapter } from './cacheAdapter';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveQueryRefChainDataByModelCategory,
  getModelComprehensiveEnumInfoByModelCategory,
  postModelComprehensiveQueryRefDataByIdsByModelCategory,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
import { getMessageTmplList } from '/@/apis/gct-apaas/MessageTmplController';
import { QueryRefChainDataRequest } from '/@/apis/gct-apaas/model';
import { transSelectData, transformData } from '/@page-designer/components/widgets/hooks/utils';
import { IRuleConfig } from '/@/components/relationship-diagram-config';

export { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';
// import { postModelComprehensiveQueryRefDataByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
const PAGE_EVENT = Symbol() as InjectionKey<Events>;
export const creatPageEvent = (event) => provide(PAGE_EVENT, event);
export const getPageEvent = () => <Events>inject(PAGE_EVENT);

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
  [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]: {
    multiple: false,
    http: getRefList,
    api: postModelDataQueryRefData,
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
  [FIELD_TYPE.BOOLEAN]: {
    multiple: false,
    http: getBooleanList,
  },
  [FIELD_TYPE.EXPRESSION]: {
    multiple: false,
    http: getBooleanList,
  },
  [FIELD_TYPE.TRANSACTION]: {
    multiple: false,
    http: getTransactionList,
  },
  [FIELD_TYPE.PRINTER]: {
    multiple: false,
    http: getPrinterList,
    api: getPrintPrintDropdownList,
  },
  [FIELD_TYPE.MESSAGE_TMPL]: {
    multiple: false,
    http: getMsgTmplList,
    api: getMessageTmplList,
  },
  [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
    multiple: false,
    http: getPrinterList,
    api: getPrintPrintDropdownList,
  },
  [FIELD_TYPE.E_DHR_TEMPLATE]: {
    multiple: false,
    http: getPrinterList,
    api: getPrintPrintDropdownList,
  },
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
  totalCount?: number;
}>;
type configParmes = {
  /**是否tree */
  isTree?: boolean;
  /**自定义数据源 */
  customApi?: Function;
  /**开启链路查询 */
  isLinkage?: boolean | (() => boolean);
};
/**根据条件识别调用的数据源函数 */
function getOptionsFunction(
  { http, api }: any,
  { isTree, customApi, isLinkage }: configParmes = {},
) {
  const optionsFun = isTree ? getRefTreeList : http;
  if (isLinkage && (typeof isLinkage === 'function' ? isLinkage() : true)) {
    return getLinkageFieldByRule;
  } else if (customApi) {
    //配置动态数据源 customApi
    return optionsFun.bind(null, async (...arg) => {
      //自定义数据源可能会依赖其他组件参数，延迟执行
      await nextTick();
      return customApi(...arg);
    });
  } else if (api) {
    return optionsFun.bind(null, api);
  } else {
    return optionsFun;
  }
}

/**链路数据转化 */
function calcLinkageData(
  fieldKey: string,
  data: IData,
  linkageField: IData[],
  ruleConfig?: IRuleConfig,
): QueryRefChainDataRequest {
  if (!ruleConfig) {
    const first = linkageField[0];
    const last = linkageField[linkageField.length - 1];
    const val = data[first.value] || data[first.id];
    const refModelChain = linkageField.slice(1).map((item) => {
      const data: any = {
        fieldKey: item.value,
        modelKey: item.modelKey,
        modelCategory: item.modelCategory,
        direction: item.reverse === true ? 'backward' : 'forward',
      };
      return data;
    });
    if (first !== last) {
      refModelChain.push({
        fieldKey: 'id_',
        modelKey: last.refModelKey,
        modelCategory: last.refModelCategory,
        direction: last.reverse === true ? 'backward' : 'forward',
      });
    }
    return {
      dataIds: val,
      modelKey: first.modelKey,
      fieldKey,
      refModelChain,
    };
  }
  const first = ruleConfig.nodes[0];
  const last = ruleConfig.nodes[ruleConfig.nodes.length - 1];
  const val = data[ruleConfig.fieldId!] || data[ruleConfig.fieldKey!];
  if (first !== last && !last.fieldKey) {
    last.fieldKey = 'id_';
    last.modelCategory = 'entity';
  }
  return {
    dataIds: val,
    modelKey: ruleConfig.modelKey,
    fieldKey,
    refModelChain: ruleConfig.nodes,
  };
}
/**根据链路搜索结果 */
async function getLinkageFieldByRule(arg) {
  const {
    modelCategory,
    fieldKey,
    data,
    linkageField,
    ruleConfig,
    pageNo = 1,
    queryData,
    exp,
  } = arg;
  const linkageData = calcLinkageData(fieldKey, data, linkageField, ruleConfig);
  if (!linkageData.dataIds) {
    return { valueList: [] };
  }
  const resData =
    (await postModelComprehensiveQueryRefChainDataByModelCategory(
      { modelCategory: modelCategory! },
      { ...linkageData, pageSize: 30, pageNo, query: queryData, exp },
    )) || {};
  const valueList =
    (resData.data as IData[])?.map((item) => {
      return {
        label: item.__LABEL__,
        value: item.id_,
        _item: item,
      };
    }) || [];
  return { valueList, dict: resData.dict };
}
/**
 * 关联模型，关联枚举,人员 部门
 * @param widgetProps
 * @returns
 */
export const useAsyncOptions = (fieldType: keyof typeof FIELD_MAP, config?: configParmes) => {
  const configdata = FIELD_MAP[fieldType] ?? {};
  const multiple = configdata.multiple;
  const options = ref<RetrunList[]>([]);
  const extraOptions = ref<RetrunList[]>([]);
  const getAsyncOptionsByApis = (): any => getOptionsFunction(configdata, config);
  const refQueryData = reactive({
    pageNo: 1,
    arg: {},
  });

  /**
   * 异步获取远程接口
   */
  async function getAsyncOptions(arg: any = {}) {
    const apis = getAsyncOptionsByApis();
    if (!apis) return [];
    refQueryData.arg = arg;
    refQueryData.pageNo = 1;
    //customApi 自定义数据源不可控不支持缓存
    const res = await cacheAdapter(arg, apis, !!config?.customApi);
    console.log('res', res);

    const { valueList = [] } = res;
    if (config?.isTree && arg?.searchType === ListTreeSearchTypeEnum.CHILDREN) {
      /**tree下面的懒加载模式 */
      options.value.push(...valueList);
    } else {
      options.value = valueList.map((i) => {
        return {
          ...i,
          type: fieldType,
        };
      });
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
    const { valueList, finished } = await cacheAdapter(
      { ...refQueryData.arg, pageNo: refQueryData.pageNo },
      apis,
      !!config?.customApi,
    );
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
    if (config?.isTree) {
      const { valueList } = await cacheAdapter({ ...arg }, apis);
      options.value = [...valueList];
    } else {
      const valueList = await cacheAdapter({ ...arg }, refOptionsByIds);
      const optionsList = options.value;
      valueList?.forEach((i) => {
        if (!optionsList.find((j) => j.value === i.value)) {
          options.value.push(i);
        }
      });
    }
  }
  /** 带状态字段的id补充选项 */
  async function getStateRefOptions(arg) {
    const apis = getAsyncOptionsByApis();
    if (!apis) return [];
    if (config?.isTree) {
      const { valueList } = await cacheAdapter({ ...arg }, apis);
      extraOptions.value = [...valueList];
    } else {
      const valueList = await cacheAdapter({ ...arg }, refOptionsByIds);
      const optionsList = options.value;
      valueList?.forEach((i) => {
        if (!optionsList.find((j) => j.value === i.value)) {
          extraOptions.value.push(i);
        }
      });
    }
  }
  /** 带状态字段的id补充查询 */
  async function getStateRefOptionsByIds(arg: any = {}) {
    const apis = getAsyncOptionsByApis();
    if (!apis) return [];
    refQueryData.arg = arg;
    refQueryData.pageNo = 1;
    //customApi 自定义数据源不可控不支持缓存
    const res = await cacheAdapter(arg, apis, !!config?.customApi);
    const { valueList = [] } = res;
    const optionsList = options.value;
    valueList.forEach((i) => {
      if (!optionsList.find((j) => j.value === i.value)) {
        options.value.push(i);
      }
    });
  }
  return {
    getRefOptionsByIds,
    getAsyncOptions,
    options,
    multiple,
    getNextOptions,
    getStateRefOptionsByIds,
    getStateRefOptions,
    extraOptions,
  };
};

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

async function getEnumList(API, { modelKey, fieldKey, modelCategory }): HttpReturnValue {
  const data =
    (await API(
      { modelCategory: modelCategory || EntityModelCategoryEnum.ENTITY },
      {
        modelKey,
        fieldKey,
      },
    )) || {};
  const valueList =
    data?.map((i) => {
      return { label: i.text!, value: i.value!, _item: i };
    }) || [];
  return { valueList };
}

/**
 * 获取部门列表
 */
async function getDeptList(API, { selectType }): HttpReturnValue {
  const data = (await API()) || [];
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
/**
 * 获取打印机列表
 */
async function getPrinterList(API): HttpReturnValue {
  const data = (await API()) || [];
  const list: Array<any> = [];
  data?.forEach((i) => {
    const dftInfo =
      (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) || undefined;
    const obj = {
      ...i,
      label: i.name,
      value: i.printKey,
      parentId: i.parentId || 'ROOT',
      dftPrintInfo:
        i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
          ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
          : undefined,
    };
    list.push({ ...obj });
    if (i.printChildNode) {
      list.push(
        ...i.printChildNode.map((e) => {
          const obj = {
            ...e,
            label: e.name,
            value: e.printKey,
            parentId: i.printKey,
          };
          return {
            ...obj,
          };
        }),
      );
    }
  });
  return { valueList: list };
}
/**
 * 获取消息模板列表
 */
async function getMsgTmplList(API): HttpReturnValue {
  const data = (await API()) || [];
  const valueList =
    data?.map((i) => {
      return { label: i.name!, value: i.key!, _item: i };
    }) || [];
  return { valueList };
}
/**
 * 获取人员列表
 * @returns
 */
async function getUserList(
  API,
  { modelKey, fieldKey, keyword, orgIds, pageNo, pageSize, ignoreCase },
): HttpReturnValue {
  const res =
    (await API({
      modelKey,
      fieldKey,
      keyword,
      ignoreCase,
      orgIds,
      pageNo,
      pageSize: pageSize || 999,
    })) || {};
  const { data = [] } = res;
  const valueList = data.map((i) => {
    return { label: i.__LABEL__!, value: i.id!, _item: i };
  });
  return { valueList, finished: res.pageNo * res.pageSize >= res.totalCount };
}

/**
 * 获取模型列表
 * @returns
 */
async function getRefList(
  API,
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
  const {
    data = [],
    totalPage,
    dict = {},
    totalCount,
  } = (await API({
    exp,
    query: { ...queryData },
    modelKey,
    fieldKey,
    pageSize: pageSize || 30,
    pageNo: pageNo || 1,
    includeDeleted,
    refModelKey: bindModelKey,
  })) || {};
  //deleted_ 表示被软删除的数据
  //_dict_item 表示翻译后的数据源
  const valueList = data?.map((i) => {
    return {
      disabled: !!i.deleted_,
      label: i.__LABEL__,
      value: i.id_ || i.id,
      _item: transformData(i, dict),
    };
  });
  return { valueList, finished: totalPage && pageNo === totalPage, totalCount };
}
/**
 *获取tree模型列表
 */
async function getRefTreeList(
  API,
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
    (await API({
      searchType,
      exp,
      query: { ...query, ...queryData },
      modelKey,
      fieldKey,
    })) || {};

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
/**
 * 获取Rdo模型列表  查询组件专用
 * @returns
 */
async function getRdoRefList(
  API,
  { bindModelKey, keyword, pageNo, modelCategory, query, exp },
): HttpReturnValue {
  const {
    data = [],
    pageSize,
    pageNo: pageNum,
    totalCount,
  } = (await API(
    {
      bsKey: 'rdoListByPage',
      modelKey: bindModelKey,
      modelCategory: modelCategory || EntityModelCategoryEnum.ENTITY,
    },
    { pageSize: 10, pageNo: pageNo || 1, query, exp },
    { keyword },
  )) || {};
  const valueList = data.map((i) => {
    return { label: i.name_, value: i.id_, _item: {} };
  });
  return { valueList, finished: pageNum * pageSize >= totalCount };
}

/** 获取布尔列表 */
export async function getBooleanList({ modelKey, fieldKey }): HttpReturnValue {
  const fieldInfo = await FieldSchema.getConfigByField(modelKey, fieldKey);
  let valueList: RetrunList[] = [];

  if (fieldInfo && fieldInfo.specificConfig) {
    const optionMap = pick(fieldInfo.specificConfig, ['true', 'false']) ?? {};
    valueList = Object.keys(optionMap).map((option: string) => {
      return {
        label: optionMap[option],
        value: option === 'true' ? true : false,
        _item: {},
      };
    });
  }
  return { valueList };
}

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
export function useGetBodyBySearch(formState, cacheColumns, expStr?: string) {
  /**
   * 转化为post请求的格式
   * @param fieldWidget
   * @param state
   */
  function transformToBody(state: object) {
    const body = {};
    let exp = expStr || '';
    cacheColumns.forEach((i) => {
      const field = i.props.fieldSearchKey || i.props.field;
      const ope = i.props.ope || [];
      let value = state[i.id];
      if ((value !== null && value !== undefined) || i.props.useMore) {
        ope.forEach((o) => {
          value = getMultipleChoiceToArray(value, o);
          const key = `${field}.${o}:${i.id}`,
            expkey = `${i.id}.${o}`;
          body[key] = i.props.useMore ? null : value;
          exp = exp.replace(expkey, key);
        });
      }
    });
    return { body, exp };
  }
  /** rdo版本关联查询数据单独处理 */
  function transformRdo(state: object, cacheColumns) {
    if (!cacheColumns.length) {
      return state;
    }
    const filterRdo = cacheColumns.filter((i) => {
      return i.props.fieldType === FIELD_TYPE.RDO_REF;
    });
    if (!filterRdo.length) {
      return state;
    }
    filterRdo.forEach((i) => {
      if (!state[i.id]) return;
      if (Array.isArray(state[i.id])) {
        state[i.id] = state[i.id].map((p) => {
          if (!p) return;
          const [_fId, _cId] = p?.split(':');
          return _cId || _fId;
        });
      } else {
        const [_fId, _cId] = state[i.id]?.split(':');
        return _cId || _fId;
      }
    });
    return state;
  }

  const { body, exp } = transformToBody(transformRdo(formState, cacheColumns));
  return { query: body, exp };
}

async function getTransactionList(): HttpReturnValue {
  const arr = await getDesignerCommonTableEntityModelList({
    type: 'TRANSACTION',
  });
  let valueList: RetrunList[] = [];
  if (arr) {
    valueList =
      (arr ?? []).map((item) => {
        return {
          label: item.name ?? '',
          value: item.key ?? '',
          _item: {},
        };
      }) ?? [];
  }
  return { valueList };
}

/**根据id查询 */
async function getRefDataById({ ids, refOriginField, refOriginFieldType, model, foreignFields }) {
  if (!ids) return Promise.reject();
  const info = await getDataByModelType(refOriginFieldType);
  if (info?.data) {
    return transSelectData(refOriginField, info.data, info.dict);
  }
  async function getDataByModelType(refOriginFieldType) {
    if (refOriginFieldType === FIELD_TYPE.RDO_REF) {
      const { data = {}, dict = {} } =
        await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            modelKey: model!,
            bsKey: 'rdoGetVersionByRefId',
            modelCategory: EntityModelCategoryEnum.ENTITY,
          },
          {
            foreignFields,
          },
          {
            refId: ids,
          },
        );
      return { data, dict };
    } else {
      const { data = {}, dict = {} } =
        await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            modelKey: model!,
            bsKey: 'getOne',
            modelCategory: EntityModelCategoryEnum.ENTITY,
          },
          {
            query: { 'id_.eq': ids },
            foreignFields,
          },
        );
      return { data, dict };
    }
  }
}

export const getRefInfoId = (arg) => cacheAdapter(arg, getRefDataById);
