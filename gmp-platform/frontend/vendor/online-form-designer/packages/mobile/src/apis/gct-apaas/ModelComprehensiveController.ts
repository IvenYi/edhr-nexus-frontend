import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityListBizServiceMeta, BizServiceRequest, ResponseEntityobject, ResponseEntityListEnumModelFieldResponse, ResponseEntityListFieldMetaDTO, ResponseEntityListModelMethodResponse, ResponseEntityListModelMetaDTO, ResponseEntityModelMetaDTO, ResponseEntityListModelBriefInfo, ResponseEntityListModelFieldAgg, QueryForeignFieldsRequest, ResponseEntityModelMultiRow, QueryRefChainDataRequest, ResponseEntityModelSingleRow, ResponseEntityModelPageableRow, QueryRefDataRequest, QueryRefDataByIdRequest, QueryRefDataByIdsRequest, QuerySearchRefChainDataRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 业务服务删除
 * import { deleteModelComprehensiveBizServiceApi } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface deleteModelComprehensiveBizServiceApiQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModelComprehensiveBizServiceApi(params: deleteModelComprehensiveBizServiceApiQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service-api`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 模型业务服务列表
 * import { getModelComprehensiveBizServiceApiListByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveBizServiceApiListByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export interface getModelComprehensiveBizServiceApiListByModelCategoryQueryInterface {
  endTime?: string; // 结束时间
  key?: string; // 服务key
  method?: string; // 服务方式
  modelKey?: string; // 模型key
  name?: string; // 服务name
  searchKey?: string; // 模糊匹配key、name
  sortNum?: number; // 排序
  startTime?: string; // 开始时间
  type?: string; // 服务类型
}
export async function getModelComprehensiveBizServiceApiListByModelCategory(path: getModelComprehensiveBizServiceApiListByModelCategoryPathInterface, params: getModelComprehensiveBizServiceApiListByModelCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListBizServiceMeta['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service-api/list/${path?.modelCategory}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 业务服务修改
 * import { putModelComprehensiveBizServiceApiById } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface putModelComprehensiveBizServiceApiByIdPathInterface {
  id: string; // id
}
export async function putModelComprehensiveBizServiceApiById(path: putModelComprehensiveBizServiceApiByIdPathInterface, data: BizServiceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service-api/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 业务服务保存
 * import { postModelComprehensiveBizServiceApiByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveBizServiceApiByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export async function postModelComprehensiveBizServiceApiByModelCategory(path: postModelComprehensiveBizServiceApiByModelCategoryPathInterface, data: BizServiceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service-api/${path?.modelCategory}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 业务服务通用请求接口(不挑method)
 * import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(path: postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKeyPathInterface, data: undefined, params: postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service/general/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 业务服务get请求接口
 * import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(path: getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface, params: getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 业务服务post请求接口
 * import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(path: postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface, data: undefined, params: postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 业务服务put请求接口
 * import { putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(path: putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface, data: undefined, params: putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'put',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 业务服务delete请求接口
 * import { deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(path: deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface, data: undefined, params: deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'delete',
      params,
      data,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 查询引用枚举数据
 * import { getModelComprehensiveEnumInfoByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveEnumInfoByModelCategoryPathInterface {
  modelCategory: string; // 模型种类:(entity/data/view) 多个类型逗号分隔
}
export interface getModelComprehensiveEnumInfoByModelCategoryQueryInterface {
  fieldKey: string; // 字段 key
  modelKey: string; // 模型 key
  searchKey?: string; // 枚举文本/枚举值
}
export async function getModelComprehensiveEnumInfoByModelCategory(path: getModelComprehensiveEnumInfoByModelCategoryPathInterface, params: getModelComprehensiveEnumInfoByModelCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListEnumModelFieldResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/enum/info/${path?.modelCategory}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * excel(按查询条件)数据导出
 * import { postModelComprehensiveExportByModelCategoryByModelKeyByTmplKey } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveExportByModelCategoryByModelKeyByTmplKeyPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
  modelKey: string; // 模型key
  tmplKey: string; // 模板key
}
export interface postModelComprehensiveExportByModelCategoryByModelKeyByTmplKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postModelComprehensiveExportByModelCategoryByModelKeyByTmplKey(path: postModelComprehensiveExportByModelCategoryByModelKeyByTmplKeyPathInterface, data: undefined, params: postModelComprehensiveExportByModelCategoryByModelKeyByTmplKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/export/${path?.modelCategory}/${path?.modelKey}/${path?.tmplKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 模型字段列表
 * import { getModelComprehensiveFieldListByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveFieldListByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export interface getModelComprehensiveFieldListByModelCategoryQueryInterface {
  includeBuiltin?: boolean; // 是否包含内置字段
  keyword?: string; // 搜索关键字
  modelKey: string; // 模型key
  sys?: boolean; // 是否包含系统字段
}
export async function getModelComprehensiveFieldListByModelCategory(path: getModelComprehensiveFieldListByModelCategoryPathInterface, params: getModelComprehensiveFieldListByModelCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFieldMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/field/list/${path?.modelCategory}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 模型方法列表
 * import { getModelComprehensiveMethodListByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveMethodListByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export interface getModelComprehensiveMethodListByModelCategoryQueryInterface {
  modelKey: string; // 模型key
}
export async function getModelComprehensiveMethodListByModelCategory(path: getModelComprehensiveMethodListByModelCategoryPathInterface, params: getModelComprehensiveMethodListByModelCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelMethodResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/method/list/${path?.modelCategory}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据模型key批量查询模型列表
 * import { getModelComprehensiveModelDetailListByKeysByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveModelDetailListByKeysByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export interface getModelComprehensiveModelDetailListByKeysByModelCategoryQueryInterface {
  modelKeys: string; // 多个模型key 逗号拼接
}
export async function getModelComprehensiveModelDetailListByKeysByModelCategory(path: getModelComprehensiveModelDetailListByKeysByModelCategoryPathInterface, params: getModelComprehensiveModelDetailListByKeysByModelCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/model/detail/listByKeys/${path?.modelCategory}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据模型key查询模型和字段详情
 * import { getModelComprehensiveModelDetailByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveModelDetailByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export interface getModelComprehensiveModelDetailByModelCategoryQueryInterface {
  modelKey: string; // 模型key
}
export async function getModelComprehensiveModelDetailByModelCategory(path: getModelComprehensiveModelDetailByModelCategoryPathInterface, params: getModelComprehensiveModelDetailByModelCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/model/detail/${path?.modelCategory}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 表单模型
 * import { getModelComprehensiveModelForm } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveModelFormQueryInterface {
  type?: string; // 实体模型类型:(NDO/RDO) 多个类型逗号分隔
}
export async function getModelComprehensiveModelForm(params: getModelComprehensiveModelFormQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelBriefInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/model/form`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 模型信息汇总
 * import { getModelComprehensiveModelSummary } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveModelSummaryQueryInterface {
  category?: string; // 模型种类:(entity/data/view) 多个类型逗号分隔
  includeSys?: number; // 是否包含系统模型
  report?: boolean; // 是否报表
  subModel?: number; // 实体模型是否为子模型 不传查询全部(1 子模型, 0 非子模型)
  supportMessage?: number; // 模型是否启用消息通知(1:启用,0:禁用)
  type?: string; // 实体模型类型:(NDO/RDO) 多个类型逗号分隔
}
export async function getModelComprehensiveModelSummary(params: getModelComprehensiveModelSummaryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelBriefInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/model/summary`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 系统模型
 * import { getModelComprehensiveModelSystem } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export async function getModelComprehensiveModelSystem(config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelFieldAgg['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/model/system`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取主模型数据以及主从关联模型数据，查询所有
 * import { postModelComprehensiveQueryAllModelDataAndDrillData } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export async function postModelComprehensiveQueryAllModelDataAndDrillData(data: QueryForeignFieldsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelMultiRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/queryAllModelDataAndDrillData`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 通过引用链数据查询引用链最后节点字段数据
 * import { postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveQueryFieldValueByRefChainDataByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export async function postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory(path: postModelComprehensiveQueryFieldValueByRefChainDataByModelCategoryPathInterface, data: QueryRefChainDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/queryFieldValueByRefChainData/${path?.modelCategory}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取主模型数据以及主从关联模型数据，查询一条
 * import { postModelComprehensiveQueryModelDataAndDrillData } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export async function postModelComprehensiveQueryModelDataAndDrillData(data: QueryForeignFieldsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelSingleRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/queryModelDataAndDrillData`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询引用链数据
 * import { postModelComprehensiveQueryRefChainDataByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveQueryRefChainDataByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export async function postModelComprehensiveQueryRefChainDataByModelCategory(path: postModelComprehensiveQueryRefChainDataByModelCategoryPathInterface, data: QueryRefChainDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/queryRefChainData/${path?.modelCategory}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询引用数据
 * import { postModelComprehensiveQueryRefDataByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveQueryRefDataByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export async function postModelComprehensiveQueryRefDataByModelCategory(path: postModelComprehensiveQueryRefDataByModelCategoryPathInterface, data: QueryRefDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/queryRefData/${path?.modelCategory}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询引用数据ById（RDO无法使用
 * import { postModelComprehensiveQueryRefDataByIdByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveQueryRefDataByIdByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export async function postModelComprehensiveQueryRefDataByIdByModelCategory(path: postModelComprehensiveQueryRefDataByIdByModelCategoryPathInterface, data: QueryRefDataByIdRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelSingleRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/queryRefDataById/${path?.modelCategory}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询引用数据ByIds（RDO无法使用）
 * import { postModelComprehensiveQueryRefDataByIdsByModelCategory } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface postModelComprehensiveQueryRefDataByIdsByModelCategoryPathInterface {
  modelCategory: string; // 分类 (entity/实体模型,view/视图模型,data/数据模型)
}
export async function postModelComprehensiveQueryRefDataByIdsByModelCategory(path: postModelComprehensiveQueryRefDataByIdsByModelCategoryPathInterface, data: QueryRefDataByIdsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelMultiRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/queryRefDataByIds/${path?.modelCategory}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询关联搜索引用链数据
 * import { postModelComprehensiveQuerySearchRefChainData } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export async function postModelComprehensiveQuerySearchRefChainData(data: QuerySearchRefChainDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/querySearchRefChainData`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取指定模型关联的子模型集合
 * import { getModelComprehensiveSubModelList } from "/@/apis/gct-apaas/ModelComprehensiveController"
 */
export interface getModelComprehensiveSubModelListQueryInterface {
  category?: string; // 模型种类:(entity/data/view) 多个类型逗号分隔
  modelKey: string; // 模型key
}
export async function getModelComprehensiveSubModelList(params: getModelComprehensiveSubModelListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-comprehensive/sub-model/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}