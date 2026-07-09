import { defHttp } from '@/utils/http/axios';
import { AuditLogSearchRequest, ResponseEntityListMapstringobject, ResponseEntityAuditLogResponse, ResponseEntityListstring, ResponseEntityListUserBaseInfo, ResponseEntityPageBaseAuditLogResponse, AuditLogRequest, ResponseEntityboolean } from './model/index';

/**
 * 审计日志导出
 * import { postAuditLogExportExternal } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export async function postAuditLogExportExternal(data: AuditLogSearchRequest, config = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/audit-log/export`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 审计日志详情
 * import { postAuditLogInfoExternal } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export interface postAuditLogInfoExternalQueryInterface {
  id: string; // id
}
export async function postAuditLogInfoExternal(params: postAuditLogInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityAuditLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/audit-log/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 功能模块
 * import { getAuditLogModulesExternal } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export interface getAuditLogModulesExternalQueryInterface {
  appId: string; // appId
}
export async function getAuditLogModulesExternal(params: getAuditLogModulesExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/audit-log/modules`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 操作类型
 * import { getAuditLogOperateTypesExternal } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export interface getAuditLogOperateTypesExternalQueryInterface {
  appId: string; // 操作页面
}
export async function getAuditLogOperateTypesExternal(params: getAuditLogOperateTypesExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/audit-log/operateTypes`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 操作人
 * import { getAuditLogOperatorsExternal } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export interface getAuditLogOperatorsExternalQueryInterface {
  appId: string; // appId
  tenantId?: string; // tenantId
}
export async function getAuditLogOperatorsExternal(params: getAuditLogOperatorsExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/audit-log/operators`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 审计日志列表查询
 * import { postAuditLogPageListExternal } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export async function postAuditLogPageListExternal(data: AuditLogSearchRequest, config = {}): Promise<ResponseEntityPageBaseAuditLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/audit-log/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用菜单
 * import { postAuditLogSaveExternal } from "/@/apis/gct-apaas/AuditLogExternalController"
 */
export async function postAuditLogSaveExternal(data: AuditLogRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/audit-log/save`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}