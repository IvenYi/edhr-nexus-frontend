import request from '@mobile/utils/request';
import type { ResponseEntityImportReportResponse, ResponseEntityListImportReportResponse, ResponseEntityPageBaseImportReportResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 详情
 * import { getImportReportInfo } from "/@/apis/gct-apaas/ImportReportController"
 */
export interface getImportReportInfoQueryInterface {
  id: string; // id
}
export async function getImportReportInfo(params: getImportReportInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityImportReportResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/import-report/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getImportReportList } from "/@/apis/gct-apaas/ImportReportController"
 */
export async function getImportReportList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListImportReportResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/import-report/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getImportReportPageList } from "/@/apis/gct-apaas/ImportReportController"
 */
export interface getImportReportPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getImportReportPageList(params: getImportReportPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseImportReportResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/import-report/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}