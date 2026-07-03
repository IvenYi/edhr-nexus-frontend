import request from '@mobile/utils/request';
import type { AuditLogSearchRequest, ResponseEntityListMapstringobject, ResponseEntityAuditLogResponse, ResponseEntityListstring, ResponseEntityListUserBaseInfo, ResponseEntityPageBaseAuditLogResponse, AuditLogRequest, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 审计日志导出
 * import { postAuditLogExport } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export async function postAuditLogExport(data: AuditLogSearchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/audit-log/export`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 审计日志详情
 * import { postAuditLogInfo } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export interface postAuditLogInfoQueryInterface {
  id: string; // id
}
export async function postAuditLogInfo(params: postAuditLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAuditLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/audit-log/info`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * 功能模块
 * import { getAuditLogModules } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export interface getAuditLogModulesQueryInterface {
  appId: string; // appId
}
export async function getAuditLogModules(params: getAuditLogModulesQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/audit-log/modules`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 操作类型
 * import { getAuditLogOperateTypes } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export interface getAuditLogOperateTypesQueryInterface {
  appId: string; // 操作页面
}
export async function getAuditLogOperateTypes(params: getAuditLogOperateTypesQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/audit-log/operateTypes`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 操作人
 * import { getAuditLogOperators } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export interface getAuditLogOperatorsQueryInterface {
  appId: string; // appId
  tenantId?: string; // tenantId
}
export async function getAuditLogOperators(params: getAuditLogOperatorsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/audit-log/operators`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 审计日志列表查询
 * import { postAuditLogPageList } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export async function postAuditLogPageList(data: AuditLogSearchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAuditLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/audit-log/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用菜单
 * import { postAuditLogSave } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export async function postAuditLogSave(data: AuditLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/audit-log/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}