import { defHttp } from '@/utils/http/axios';
import { ViewModelRequest, ResponseEntitystring, ResponseEntityViewModelFieldResponse, ResponseEntityViewModelResponse, ResponseEntityListViewModelResponse, ResponseEntityPageBaseViewModelResponse } from './model/index';

/**
 * 保存
 * import { postViewModel } from "/@/apis/gct-apaas/ViewModelController"
 */
export async function postViewModel(data: ViewModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/view-model`,
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
 * import { deleteViewModel } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface deleteViewModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteViewModel(params: deleteViewModelQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/view-model`,
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
 * 模型列详情
 * import { getViewModelFieldInfo } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface getViewModelFieldInfoQueryInterface {
  id: string; // id
}
export async function getViewModelFieldInfo(params: getViewModelFieldInfoQueryInterface = {}, config = {}): Promise<ResponseEntityViewModelFieldResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/view-model/field/info`,
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
 * import { getViewModelInfo } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface getViewModelInfoQueryInterface {
  id: string; // id
}
export async function getViewModelInfo(params: getViewModelInfoQueryInterface = {}, config = {}): Promise<ResponseEntityViewModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/view-model/info`,
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
 * import { getViewModelList } from "/@/apis/gct-apaas/ViewModelController"
 */
export async function getViewModelList(config = {}): Promise<ResponseEntityListViewModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/view-model/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getViewModelPageList } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface getViewModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getViewModelPageList(params: getViewModelPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseViewModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/view-model/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查看sql
 * import { getViewModelSql } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface getViewModelSqlQueryInterface {
  id: string; // id
}
export async function getViewModelSql(params: getViewModelSqlQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/view-model/sql`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 模型启用禁用支持消息
 * import { putViewModelSupportMessageByModelKeyByEnabled } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface putViewModelSupportMessageByModelKeyByEnabledPathInterface {
  enabled: number; // 状态(1:启用 ,0: 禁用)
  modelKey: string; // 模型key
}
export async function putViewModelSupportMessageByModelKeyByEnabled(path: putViewModelSupportMessageByModelKeyByEnabledPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/view-model/support-message/${path?.modelKey}/${path?.enabled}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putViewModelById } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface putViewModelByIdPathInterface {
  id: string; // id
}
export async function putViewModelById(path: putViewModelByIdPathInterface, data: ViewModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/view-model/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}