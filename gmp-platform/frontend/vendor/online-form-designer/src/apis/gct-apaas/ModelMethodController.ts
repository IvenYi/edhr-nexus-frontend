import { defHttp } from '@/utils/http/axios';
import { ModelMethodRequest, ResponseEntitystring, ResponseEntityListModelMethodResponse, ResponseEntityModelMethodResponse, ResponseEntityPageBaseModelMethodResponse } from './model/index';

/**
 * 保存
 * import { postModelMethod } from "/@/apis/gct-apaas/ModelMethodController"
 */
export async function postModelMethod(data: ModelMethodRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/model-method`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteModelMethod } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface deleteModelMethodQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModelMethod(params: deleteModelMethodQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/model-method`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 数据模型方法列表
 * import { getModelMethodDataModelList } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodDataModelListQueryInterface {
  keyword?: string; // 搜索关键字
}
export async function getModelMethodDataModelList(params: getModelMethodDataModelListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMethodResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-method/data-model/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getModelMethodInfo } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodInfoQueryInterface {
  id: string; // id
}
export async function getModelMethodInfo(params: getModelMethodInfoQueryInterface = {}, config = {}): Promise<ResponseEntityModelMethodResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-method/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getModelMethodList } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodListQueryInterface {
  keyword?: string; // 搜索关键字
  modelKey: string; // 模型key
}
export async function getModelMethodList(params: getModelMethodListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMethodResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-method/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getModelMethodPageList } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getModelMethodPageList(params: getModelMethodPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseModelMethodResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-method/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 视图模型方法列表
 * import { getModelMethodViewModelList } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface getModelMethodViewModelListQueryInterface {
  keyword?: string; // 搜索关键字
}
export async function getModelMethodViewModelList(params: getModelMethodViewModelListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelMethodResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-method/view-model/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putModelMethodById } from "/@/apis/gct-apaas/ModelMethodController"
 */
export interface putModelMethodByIdPathInterface {
  id: string; // id
}
export async function putModelMethodById(path: putModelMethodByIdPathInterface, data: ModelMethodRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/model-method/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}