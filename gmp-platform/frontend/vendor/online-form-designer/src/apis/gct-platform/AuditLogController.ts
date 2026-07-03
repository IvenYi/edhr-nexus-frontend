import { defHttp } from '@/utils/http/axios';
import { AuditLogSearchRequest, ResponseEntitystring, ResponseEntityAuditLogResponse, ResponseEntityListstring, ResponseEntityListUserBaseInfo, ResponseEntityPageBaseAuditLogResponse } from './model/index';

/**
 * 导出
 * import { postAuditLogExport } from "/@/apis/gct-platform/AuditLogController"
 */
export async function postAuditLogExport(data: AuditLogSearchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/audit-log/export`,
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
 * import { getAuditLogInfo } from "/@/apis/gct-platform/AuditLogController"
 */
export interface getAuditLogInfoQueryInterface {
  id: string; // id
}
export async function getAuditLogInfo(params: getAuditLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAuditLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/audit-log/info`,
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
 * import { getAuditLogModules } from "/@/apis/gct-platform/AuditLogController"
 */
export async function getAuditLogModules(config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/audit-log/modules`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 操作类型
 * import { getAuditLogOperateTypes } from "/@/apis/gct-platform/AuditLogController"
 */
export async function getAuditLogOperateTypes(config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/audit-log/operateTypes`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 操作人
 * import { getAuditLogOperators } from "/@/apis/gct-platform/AuditLogController"
 */
export async function getAuditLogOperators(config = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/audit-log/operators`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postAuditLogPageList } from "/@/apis/gct-platform/AuditLogController"
 */
export async function postAuditLogPageList(data: AuditLogSearchRequest, config = {}): Promise<ResponseEntityPageBaseAuditLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/audit-log/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}