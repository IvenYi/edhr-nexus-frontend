import { defHttp } from '@/utils/http/axios';
import { ModelRequest, ResponseEntitystring, ResponseEntityModelResponse, ResponseEntityListModelResponse, ResponseEntityPageBaseModelResponse } from './model/index';

/**
 * 保存
 * import { postModel } from "/@/apis/gct-platform/ModelController"
 */
export async function postModel(data: ModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/model`,
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
 * import { deleteModel } from "/@/apis/gct-platform/ModelController"
 */
export interface deleteModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModel(params: deleteModelQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/model`,
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
 * 详情
 * import { getModelInfo } from "/@/apis/gct-platform/ModelController"
 */
export interface getModelInfoQueryInterface {
  id: string; // id
}
export async function getModelInfo(params: getModelInfoQueryInterface = {}, config = {}): Promise<ResponseEntityModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/model/info`,
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
 * import { getModelList } from "/@/apis/gct-platform/ModelController"
 */
export async function getModelList(config = {}): Promise<ResponseEntityListModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/model/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getModelPageList } from "/@/apis/gct-platform/ModelController"
 */
export interface getModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getModelPageList(params: getModelPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/model/page/list`,
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
 * import { putModelById } from "/@/apis/gct-platform/ModelController"
 */
export interface putModelByIdPathInterface {
  id: string; // id
}
export async function putModelById(path: putModelByIdPathInterface, data: ModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/model/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}