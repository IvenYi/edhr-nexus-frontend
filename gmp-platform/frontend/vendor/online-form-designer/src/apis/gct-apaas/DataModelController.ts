import { defHttp } from '@/utils/http/axios';
import { DataModelRequest, ResponseEntitystring, ResponseEntityDataModelResponse, ResponseEntityListDataModelResponse, ResponseEntityPageBaseDataModelResponse } from './model/index';

/**
 * 数据模型保存
 * import { postDataModel } from "/@/apis/gct-apaas/DataModelController"
 */
export async function postDataModel(data: DataModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/data-model`,
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
 * import { deleteDataModel } from "/@/apis/gct-apaas/DataModelController"
 */
export interface deleteDataModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDataModel(params: deleteDataModelQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/data-model`,
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
 * import { getDataModelInfo } from "/@/apis/gct-apaas/DataModelController"
 */
export interface getDataModelInfoQueryInterface {
  id: string; // id
}
export async function getDataModelInfo(params: getDataModelInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDataModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/data-model/info`,
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
 * import { getDataModelList } from "/@/apis/gct-apaas/DataModelController"
 */
export async function getDataModelList(config = {}): Promise<ResponseEntityListDataModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/data-model/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDataModelPageList } from "/@/apis/gct-apaas/DataModelController"
 */
export interface getDataModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDataModelPageList(params: getDataModelPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDataModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/data-model/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 数据模型修改
 * import { putDataModelById } from "/@/apis/gct-apaas/DataModelController"
 */
export interface putDataModelByIdPathInterface {
  id: string; // id
}
export async function putDataModelById(path: putDataModelByIdPathInterface, data: DataModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/data-model/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}