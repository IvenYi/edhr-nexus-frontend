import { defHttp } from '@/utils/http/axios';
import { ProcessApprovalLogRequest, ResponseEntitystring, ResponseEntityProcessHistoryResult, ResponseEntityProcessApprovalLogResponse, ResponseEntityListProcessApprovalLogResponse, ResponseEntityPageBaseProcessApprovalLogResponse } from './model/index';

/**
 * 保存
 * import { postProcessApprovalLog } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export async function postProcessApprovalLog(data: ProcessApprovalLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-approval-log`,
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
 * import { deleteProcessApprovalLog } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface deleteProcessApprovalLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessApprovalLog(params: deleteProcessApprovalLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-approval-log`,
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
 * import { getProcessApprovalLogApproveHistory } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface getProcessApprovalLogApproveHistoryQueryInterface {
  id_: string; // id_
}
export async function getProcessApprovalLogApproveHistory(params: getProcessApprovalLogApproveHistoryQueryInterface = {}, config = {}): Promise<ResponseEntityProcessHistoryResult['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-approval-log/approveHistory`,
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
 * import { getProcessApprovalLogInfo } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface getProcessApprovalLogInfoQueryInterface {
  id: string; // id
}
export async function getProcessApprovalLogInfo(params: getProcessApprovalLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessApprovalLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-approval-log/info`,
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
 * import { getProcessApprovalLogList } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export async function getProcessApprovalLogList(config = {}): Promise<ResponseEntityListProcessApprovalLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-approval-log/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessApprovalLogPageList(params: getProcessApprovalLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessApprovalLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-approval-log/page/list`,
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
 * import { putProcessApprovalLogById } from "/@/apis/gct-apaas/ProcessApprovalLogController"
 */
export interface putProcessApprovalLogByIdPathInterface {
  id: string; // id
}
export async function putProcessApprovalLogById(path: putProcessApprovalLogByIdPathInterface, data: ProcessApprovalLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-approval-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}