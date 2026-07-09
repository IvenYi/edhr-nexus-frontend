import request from '@mobile/utils/request';
import type { ApprovalLogRequest, ResponseEntitystring, ResponseEntityApprovalLogResponse, ResponseEntityListApprovalLogResponse, ResponseEntityPageBaseApprovalLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postApprovalLog } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export async function postApprovalLog(data: ApprovalLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approval-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteApprovalLog } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export interface deleteApprovalLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteApprovalLog(params: deleteApprovalLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approval-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getApprovalLogInfo } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export interface getApprovalLogInfoQueryInterface {
  id: string; // id
}
export async function getApprovalLogInfo(params: getApprovalLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityApprovalLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/approval-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getApprovalLogList } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export async function getApprovalLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListApprovalLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/approval-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getApprovalLogPageList } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export interface getApprovalLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getApprovalLogPageList(params: getApprovalLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseApprovalLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/approval-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putApprovalLogById } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export interface putApprovalLogByIdPathInterface {
  id: string; // id
}
export async function putApprovalLogById(path: putApprovalLogByIdPathInterface, data: ApprovalLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/approval-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}