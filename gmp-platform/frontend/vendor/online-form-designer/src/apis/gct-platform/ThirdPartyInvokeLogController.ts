import { defHttp } from '@/utils/http/axios';
import { ResponseEntityThirdPartyInvokeLogResponse, ResponseEntityPageBaseThirdPartyInvokeLogResponse } from './model/index';

/**
 * 导出日志
 * import { getInvokeLogExport } from "/@/apis/gct-platform/ThirdPartyInvokeLogController"
 */
export interface getInvokeLogExportQueryInterface {
  id: string; // id
}
export async function getInvokeLogExport(params: getInvokeLogExportQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-platform/api/invoke-log/export`,
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
 * import { getInvokeLogInfo } from "/@/apis/gct-platform/ThirdPartyInvokeLogController"
 */
export interface getInvokeLogInfoQueryInterface {
  id: string; // id
}
export async function getInvokeLogInfo(params: getInvokeLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityThirdPartyInvokeLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/invoke-log/info`,
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
 * import { getInvokeLogPageList } from "/@/apis/gct-platform/ThirdPartyInvokeLogController"
 */
export interface getInvokeLogPageListQueryInterface {
  beginTime?: string; // 调用时间起
  body?: string; // 请求体
  endTime?: string; // 调用时间止
  env?: string; // 环境
  key?: string; // 接口标识
  name?: string; // 接口名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  response?: string; // 响应体
  result?: number; // 调用结果
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}
export async function getInvokeLogPageList(params: getInvokeLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseThirdPartyInvokeLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/invoke-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}