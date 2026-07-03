import request from '@mobile/utils/request';
import type { AuditLogSearchRequest, ResponseEntitystring, ResponseEntityAuditLogResponse, ResponseEntityListstring, ResponseEntityListOperateTypeDTO, ResponseEntityListUserBaseInfo, ResponseEntityPageBaseAuditLogResponse, AuditLogRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 导出
 * import { postAuditLogExport } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function postAuditLogExport(data: AuditLogSearchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/audit-log/export`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAuditLogInfo } from "/@/apis/gct-apaas/AuditLogController"
 */
export interface getAuditLogInfoQueryInterface {
  id: string; // id
}
export async function getAuditLogInfo(params: getAuditLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAuditLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/audit-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 功能模块
 * import { getAuditLogModules } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function getAuditLogModules(config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/audit-log/modules`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 操作类型
 * import { getAuditLogOperateTypes } from "/@/apis/gct-apaas/AuditLogController"
 */
export interface getAuditLogOperateTypesQueryInterface {
  moduleType: string; // 功能模块
}
export async function getAuditLogOperateTypes(params: getAuditLogOperateTypesQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOperateTypeDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/audit-log/operateTypes`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 操作人
 * import { getAuditLogOperators } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function getAuditLogOperators(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/audit-log/operators`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postAuditLogPageList } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function postAuditLogPageList(data: AuditLogSearchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAuditLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/audit-log/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postAuditLogSave } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function postAuditLogSave(data: AuditLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/audit-log/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}