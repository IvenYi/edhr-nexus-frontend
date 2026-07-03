import request from '@mobile/utils/request';
import type { ProcessRequest, ResponseEntitystring, ResponseEntityProcessResponse, ResponseEntityListProcessResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcess } from "/@/apis/gct-apaas/ProcessController"
 */
export async function postProcess(data: ProcessRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process`,
      method: 'post',
      data,
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
export async function deleteProcess(params: deleteProcessQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process`,
      method: 'delete',
      params,
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
export async function getProcessInfo(params: getProcessInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process/info`,
      method: 'get',
      params,
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
export async function getProcessList(params: getProcessListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process/list`,
      method: 'get',
      params,
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
export async function putProcessById(path: putProcessByIdPathInterface, data: ProcessRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}