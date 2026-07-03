import { defHttp } from '@/utils/http/axios';
import { AuditLogSearchRequest, ResponseEntitystring, ResponseEntityAuditLogResponse, ResponseEntityListstring, ResponseEntityListOperateTypeDTO, ResponseEntityListUserBaseInfo, ResponseEntityPageBaseAuditLogResponse, AuditLogRequest } from './model/index';

/**
 * 导出
 * import { postAuditLogExport } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function postAuditLogExport(data: AuditLogSearchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/audit-log/export`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getAuditLogInfo(params: getAuditLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAuditLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/audit-log/info`,
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
 * import { getAuditLogModules } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function getAuditLogModules(config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/audit-log/modules`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getAuditLogOperateTypes(params: getAuditLogOperateTypesQueryInterface = {}, config = {}): Promise<ResponseEntityListOperateTypeDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/audit-log/operateTypes`,
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
 * import { getAuditLogOperators } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function getAuditLogOperators(config = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/audit-log/operators`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postAuditLogPageList } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function postAuditLogPageList(data: AuditLogSearchRequest, config = {}): Promise<ResponseEntityPageBaseAuditLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/audit-log/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postAuditLogSave } from "/@/apis/gct-apaas/AuditLogController"
 */
export async function postAuditLogSave(data: AuditLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/audit-log/save`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}