import request from '@mobile/utils/request';
import type { PrintLogRequest, ResponseEntitystring, ResponseEntityPrintLogResponse, ResponseEntityListPrintLogResponse, ResponseEntityPageBasePrintLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPrintLog } from "/@/apis/gct-platform/PrintLogController"
 */
export async function postPrintLog(data: PrintLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/print-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getPrintLogInfo } from "/@/apis/gct-platform/PrintLogController"
 */
export interface getPrintLogInfoQueryInterface {
  id: string; // id
}
export async function getPrintLogInfo(params: getPrintLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPrintLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/print-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPrintLogList } from "/@/apis/gct-platform/PrintLogController"
 */
export interface getPrintLogListQueryInterface {
  key: string; // key
}
export async function getPrintLogList(params: getPrintLogListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/print-log/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPrintLogPageList } from "/@/apis/gct-platform/PrintLogController"
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
export async function getPrintLogPageList(params: getPrintLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePrintLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/print-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}