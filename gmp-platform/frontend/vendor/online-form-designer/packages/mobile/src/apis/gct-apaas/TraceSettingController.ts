import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityListTraceSettingResponse, ResponseEntityTraceSettingResponse, TraceSettingRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteTraceSetting } from "/@/apis/gct-apaas/TraceSettingController"
 */
export interface deleteTraceSettingQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTraceSetting(params: deleteTraceSettingQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-setting`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 列表
 * import { getTraceSettingList } from "/@/apis/gct-apaas/TraceSettingController"
 */
export async function getTraceSettingList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListTraceSettingResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-setting/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 根据模型key查询模型树
 * import { getTraceSettingTreeByModelKey } from "/@/apis/gct-apaas/TraceSettingController"
 */
export interface getTraceSettingTreeByModelKeyQueryInterface {
  modelKey: string; // modelKey
}
export async function getTraceSettingTreeByModelKey(params: getTraceSettingTreeByModelKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTraceSettingResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-setting/treeByModelKey`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putTraceSettingById } from "/@/apis/gct-apaas/TraceSettingController"
 */
export interface putTraceSettingByIdPathInterface {
  id: string; // id
}
export async function putTraceSettingById(path: putTraceSettingByIdPathInterface, data: TraceSettingRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/trace-setting/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}