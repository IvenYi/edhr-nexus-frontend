import request from '@mobile/utils/request';
import type { MergeLogRequest, ResponseEntitystring, ResponseEntityMergeLogResponse, ResponseEntityListMergeLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postMergeLog } from "/@/apis/gct-apaas/MergeLogController"
 */
export async function postMergeLog(data: MergeLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/merge-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteMergeLog } from "/@/apis/gct-apaas/MergeLogController"
 */
export interface deleteMergeLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMergeLog(params: deleteMergeLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/merge-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getMergeLogInfo } from "/@/apis/gct-apaas/MergeLogController"
 */
export interface getMergeLogInfoQueryInterface {
  id: string; // id
}
export async function getMergeLogInfo(params: getMergeLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMergeLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/merge-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getMergeLogList } from "/@/apis/gct-apaas/MergeLogController"
 */
export async function getMergeLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListMergeLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/merge-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 修改
 * import { putMergeLogById } from "/@/apis/gct-apaas/MergeLogController"
 */
export interface putMergeLogByIdPathInterface {
  id: string; // id
}
export async function putMergeLogById(path: putMergeLogByIdPathInterface, data: MergeLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/merge-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}