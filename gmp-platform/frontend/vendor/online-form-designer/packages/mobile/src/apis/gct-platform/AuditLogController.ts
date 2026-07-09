import request from '@mobile/utils/request';
import type { AuditLogSearchRequest, ResponseEntitystring, ResponseEntityAuditLogResponse, ResponseEntityListstring, ResponseEntityListUserBaseInfo, ResponseEntityPageBaseAuditLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 导出
 * import { postAuditLogExport } from "/@/apis/gct-platform/AuditLogController"
 */
export async function postAuditLogExport(data: AuditLogSearchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/audit-log/export`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAuditLogInfo } from "/@/apis/gct-platform/AuditLogController"
 */
export interface getAuditLogInfoQueryInterface {
  id: string; // id
}
export async function getAuditLogInfo(params: getAuditLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAuditLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/audit-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 功能模块
 * import { getAuditLogModules } from "/@/apis/gct-platform/AuditLogController"
 */
export async function getAuditLogModules(config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/api/audit-log/modules`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 操作类型
 * import { getAuditLogOperateTypes } from "/@/apis/gct-platform/AuditLogController"
 */
export async function getAuditLogOperateTypes(config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/api/audit-log/operateTypes`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 操作人
 * import { getAuditLogOperators } from "/@/apis/gct-platform/AuditLogController"
 */
export async function getAuditLogOperators(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return request(
    {
      url: `/gct-platform/api/audit-log/operators`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postAuditLogPageList } from "/@/apis/gct-platform/AuditLogController"
 */
export async function postAuditLogPageList(data: AuditLogSearchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAuditLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/audit-log/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}