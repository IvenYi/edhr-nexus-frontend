import { defHttp } from '@/utils/http/axios';
import { ProcessRequest, ResponseEntitystring, ResponseEntityProcessResponse, ResponseEntityListProcessResponse } from './model/index';

/**
 * 保存
 * import { postProcess } from "/@/apis/gct-apaas/ProcessController"
 */
export async function postProcess(data: ProcessRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process`,
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
 * import { deleteProcess } from "/@/apis/gct-apaas/ProcessController"
 */
export interface deleteProcessQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcess(params: deleteProcessQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process`,
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
 * import { getProcessInfo } from "/@/apis/gct-apaas/ProcessController"
 */
export interface getProcessInfoQueryInterface {
  id: string; // id
}
export async function getProcessInfo(params: getProcessInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process/info`,
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
 * import { getProcessList } from "/@/apis/gct-apaas/ProcessController"
 */
export interface getProcessListQueryInterface {
  tableMetaId?: string; // tableMetaId
  tableMetaKey?: string; // tableMetaKey
}
export async function getProcessList(params: getProcessListQueryInterface = {}, config = {}): Promise<ResponseEntityListProcessResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process/list`,
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
 * import { putProcessById } from "/@/apis/gct-apaas/ProcessController"
 */
export interface putProcessByIdPathInterface {
  id: string; // id
}
export async function putProcessById(path: putProcessByIdPathInterface, data: ProcessRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}