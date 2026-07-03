import { defHttp } from '@/utils/http/axios';
import { ModelProviderRequest, ResponseEntitystring, ResponseEntityModelProviderResponse, ResponseEntityListModelProviderResponse, ResponseEntityPageBaseModelProviderResponse } from './model/index';

/**
 * 保存
 * import { postModelProvider } from "/@/apis/gct-platform/ModelProviderController"
 */
export async function postModelProvider(data: ModelProviderRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/model-provider`,
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
 * import { deleteModelProvider } from "/@/apis/gct-platform/ModelProviderController"
 */
export interface deleteModelProviderQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModelProvider(params: deleteModelProviderQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/model-provider`,
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
 * import { getModelProviderInfo } from "/@/apis/gct-platform/ModelProviderController"
 */
export interface getModelProviderInfoQueryInterface {
  id: string; // id
}
export async function getModelProviderInfo(params: getModelProviderInfoQueryInterface = {}, config = {}): Promise<ResponseEntityModelProviderResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/model-provider/info`,
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
 * import { getModelProviderList } from "/@/apis/gct-platform/ModelProviderController"
 */
export async function getModelProviderList(config = {}): Promise<ResponseEntityListModelProviderResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/model-provider/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getModelProviderPageList } from "/@/apis/gct-platform/ModelProviderController"
 */
export interface getModelProviderPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getModelProviderPageList(params: getModelProviderPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseModelProviderResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/model-provider/page/list`,
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
 * import { putModelProviderById } from "/@/apis/gct-platform/ModelProviderController"
 */
export interface putModelProviderByIdPathInterface {
  id: string; // id
}
export async function putModelProviderById(path: putModelProviderByIdPathInterface, data: ModelProviderRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/model-provider/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}