import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityListTableMetaResponse, ResponseEntityListCategoryCompleteResponse, ResponseEntityTableFieldMetaDTO, ResponseEntityTableMetaER, ResponseEntityTableMetaResponse, ResponseEntityPageBaseTableMetaResponse, TableMetaRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除实体模型
 * import { deleteTableMeta } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface deleteTableMetaQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTableMeta(params: deleteTableMetaQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 获取汇总模型列表
 * import { getTableMetaAggList } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaAggListQueryInterface {
  modelKey: string; // 模型key
}
export async function getTableMetaAggList(params: getTableMetaAggListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTableMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/agg/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取汇总模型列表
 * import { getTableMetaAggModel } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaAggModelQueryInterface {
  modelKey: string; // 模型key
}
export async function getTableMetaAggModel(params: getTableMetaAggModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/agg/model`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据模型key批量查询模型列表
 * import { getTableMetaByKeys } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaByKeysQueryInterface {
  modelKeys: string; // 多个模型key 逗号拼接
}
export async function getTableMetaByKeys(params: getTableMetaByKeysQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTableMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/by/keys`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据模型key查询模型和字段详情
 * import { getTableMetaDetail } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaDetailQueryInterface {
  modelKey: string; // 模型key
}
export async function getTableMetaDetail(params: getTableMetaDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTableFieldMetaDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/detail`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 实体模型默认显示字段配置
 * import { putTableMetaDisplayByModelKeyByFieldKey } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface putTableMetaDisplayByModelKeyByFieldKeyPathInterface {
  fieldKey: string; // 显示字段 fieldKey
  modelKey: string; // 模型key
}
export async function putTableMetaDisplayByModelKeyByFieldKey(path: putTableMetaDisplayByModelKeyByFieldKeyPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/display/${path?.modelKey}/${path?.fieldKey}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 实体模型ER图查询
 * import { getTableMetaEr } from "/@/apis/gct-apaas/TableMetaController"
 */
export async function getTableMetaEr(config:AxiosRequestConfig = {}): Promise<ResponseEntityTableMetaER['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/er`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getTableMetaInfo } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaInfoQueryInterface {
  id: string; // id
}
export async function getTableMetaInfo(params: getTableMetaInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTableMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 模型列表查询
 * import { getTableMetaList } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaListQueryInterface {
  categoryId?: string; // 分类id
  type?: string; // 模型标志:(NDO/RDO)
}
export async function getTableMetaList(params: getTableMetaListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTableMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取所有模型
 * import { getTableMetaListAll } from "/@/apis/gct-apaas/TableMetaController"
 */
export async function getTableMetaListAll(config:AxiosRequestConfig = {}): Promise<ResponseEntityListTableMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/list-all`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 回收站模型分页列表
 * import { getTableMetaPageGetRecycledList } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaPageGetRecycledListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getTableMetaPageGetRecycledList(params: getTableMetaPageGetRecycledListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTableMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/page/getRecycledList`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTableMetaPageList } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getTableMetaPageList(params: getTableMetaPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseTableMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 从回收站恢复模型
 * import { putTableMetaPageRecycledRestoreByModelKey } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface putTableMetaPageRecycledRestoreByModelKeyPathInterface {
  modelKey: string; // modelKey
}
export async function putTableMetaPageRecycledRestoreByModelKey(path: putTableMetaPageRecycledRestoreByModelKeyPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/page/recycledRestore/${path?.modelKey}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 查询启用权限模型列表查询
 * import { getTableMetaPermissionEnabledList } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface getTableMetaPermissionEnabledListQueryInterface {
  permissionEnabled?: string; // 是否启用权限 1启用,0未启用
  type?: string; // 模型标志:(NDO/RDO)
}
export async function getTableMetaPermissionEnabledList(params: getTableMetaPermissionEnabledListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListTableMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/permission-enabled/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 实体模型保存
 * import { postTableMetaSave } from "/@/apis/gct-apaas/TableMetaController"
 */
export async function postTableMetaSave(data: TableMetaRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取支持流程的模型树
 * import { getTableMetaSupportProcess } from "/@/apis/gct-apaas/TableMetaController"
 */
export async function getTableMetaSupportProcess(config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/support-process`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 实体模型编辑
 * import { putTableMetaById } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface putTableMetaByIdPathInterface {
  id: string; // id
}
export async function putTableMetaById(path: putTableMetaByIdPathInterface, data: TableMetaRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 实体模型编辑 启用禁用权限
 * import { putTableMetaByModelKeyByEnabled } from "/@/apis/gct-apaas/TableMetaController"
 */
export interface putTableMetaByModelKeyByEnabledPathInterface {
  enabled: number; // 状态(1:启用 ,0: 禁用)
  modelKey: string; // 模型key
}
export async function putTableMetaByModelKeyByEnabled(path: putTableMetaByModelKeyByEnabledPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/table-meta/${path?.modelKey}/${path?.enabled}`,
      method: 'put',
      ...config,
    },
  );
}