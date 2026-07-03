import request from '@mobile/utils/request';
import type { ResponseEntityThirdPartyInvokeLogResponse, ResponseEntityPageBaseThirdPartyInvokeLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 导出日志
 * import { getInvokeLogExport } from "/@/apis/gct-platform/ThirdPartyInvokeLogController"
 */
export interface getInvokeLogExportQueryInterface {
  id: string; // id
}
export async function getInvokeLogExport(params: getInvokeLogExportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/invoke-log/export`,
      method: 'get',
      params,
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
export async function getInvokeLogInfo(params: getInvokeLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityThirdPartyInvokeLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/invoke-log/info`,
      method: 'get',
      params,
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
export async function getInvokeLogPageList(params: getInvokeLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseThirdPartyInvokeLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/invoke-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}