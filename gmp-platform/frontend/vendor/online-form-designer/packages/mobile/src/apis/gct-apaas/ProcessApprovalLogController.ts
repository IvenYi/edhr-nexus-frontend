import request from '@mobile/utils/request';
import type { ProcessApprovalLogRequest, ResponseEntitystring, ResponseEntityProcessHistoryResult, ResponseEntityProcessApprovalLogResponse, ResponseEntityListProcessApprovalLogResponse, ResponseEntityPageBaseProcessApprovalLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessApprovalLog } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export async function postProcessApprovalLog(data: ProcessApprovalLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approval-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessApprovalLog } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface deleteProcessApprovalLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessApprovalLog(params: deleteProcessApprovalLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approval-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessApprovalLogApproveHistory } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface getProcessApprovalLogApproveHistoryQueryInterface {
  id_: string; // id_
}
export async function getProcessApprovalLogApproveHistory(params: getProcessApprovalLogApproveHistoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessHistoryResult['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approval-log/approveHistory`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessApprovalLogInfo } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface getProcessApprovalLogInfoQueryInterface {
  id: string; // id
}
export async function getProcessApprovalLogInfo(params: getProcessApprovalLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessApprovalLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approval-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessApprovalLogList } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export async function getProcessApprovalLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessApprovalLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approval-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessApprovalLogPageList } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface getProcessApprovalLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessApprovalLogPageList(params: getProcessApprovalLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessApprovalLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approval-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessApprovalLogById } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface putProcessApprovalLogByIdPathInterface {
  id: string; // id
}
export async function putProcessApprovalLogById(path: putProcessApprovalLogByIdPathInterface, data: ProcessApprovalLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-approval-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}