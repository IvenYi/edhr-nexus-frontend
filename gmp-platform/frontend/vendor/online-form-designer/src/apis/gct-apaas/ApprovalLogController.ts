import { defHttp } from '@/utils/http/axios';
import { ApprovalLogRequest, ResponseEntitystring, ResponseEntityApprovalLogResponse, ResponseEntityListApprovalLogResponse, ResponseEntityPageBaseApprovalLogResponse } from './model/index';

/**
 * 保存
 * import { postApprovalLog } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export async function postApprovalLog(data: ApprovalLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/approval-log`,
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
 * import { deleteApprovalLog } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export interface deleteApprovalLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteApprovalLog(params: deleteApprovalLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/approval-log`,
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
 * import { getApprovalLogInfo } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export interface getApprovalLogInfoQueryInterface {
  id: string; // id
}
export async function getApprovalLogInfo(params: getApprovalLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityApprovalLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/approval-log/info`,
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
 * import { getApprovalLogList } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export async function getApprovalLogList(config = {}): Promise<ResponseEntityListApprovalLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/approval-log/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getApprovalLogPageList(params: getApprovalLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseApprovalLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/approval-log/page/list`,
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
 * import { putApprovalLogById } from "/@/apis/gct-apaas/ApprovalLogController"
 */
export interface putApprovalLogByIdPathInterface {
  id: string; // id
}
export async function putApprovalLogById(path: putApprovalLogByIdPathInterface, data: ApprovalLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/approval-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}