import { defHttp } from '@/utils/http/axios';
import { PrintLogRequest, ResponseEntitystring, ResponseEntityPrintLogResponse, ResponseEntityListPrintLogResponse, ResponseEntityPageBasePrintLogResponse, PrintLogSearchRequest } from './model/index';

/**
 * 保存
 * import { postPrintLog } from "/@/apis/gct-platform/ExternalPrintLogController"
 */
export async function postPrintLog(data: PrintLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/print-log`,
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
 * import { getPrintLogInfo } from "/@/apis/gct-platform/ExternalPrintLogController"
 */
export interface getPrintLogInfoQueryInterface {
  id: string; // id
}
export async function getPrintLogInfo(params: getPrintLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPrintLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/print-log/info`,
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
 * import { getPrintLogList } from "/@/apis/gct-platform/ExternalPrintLogController"
 */
export interface getPrintLogListQueryInterface {
  key: string; // key
}
export async function getPrintLogList(params: getPrintLogListQueryInterface = {}, config = {}): Promise<ResponseEntityListPrintLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/print-log/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPrintLogPageList } from "/@/apis/gct-platform/ExternalPrintLogController"
 */
export interface getPrintLogPageListQueryInterface {
  branchId?: string; // 分支
  endTime?: string; // 结束时间
  env?: string; // 环境
  key?: string; // key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  printAppId?: string; // printAppId
  printAppName?: string; // 触发打印的应用名称
  printName?: string; // printName
  printType?: string; // 打印的类型
  resourceName?: string; // resourceName
  resourceType?: string; // resourceType
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getPrintLogPageList(params: getPrintLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePrintLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/print-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postPrintLogPageListExternal } from "/@/apis/gct-platform/ExternalPrintLogController"
 */
export async function postPrintLogPageListExternal(data: PrintLogSearchRequest, config = {}): Promise<ResponseEntityPageBasePrintLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/print-log/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}