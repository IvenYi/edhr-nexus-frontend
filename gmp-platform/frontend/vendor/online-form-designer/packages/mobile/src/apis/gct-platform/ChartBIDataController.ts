import request from '@mobile/utils/request';
import type { BIChartExportDTO, ResponseEntityBiShareResponse, BIChartConditionDTO, ResponseEntitySqlResult, ResponseEntityPnPageResponse, ResponseEntityPnProjectResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 图数据导出
 * import { postReportDataExport } from "/@/apis/gct-platform/ChartBIDataController"
 */
export async function postReportDataExport(data: BIChartExportDTO, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/external/api/report-data/export`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getReportDataInfo } from "/@/apis/gct-platform/ChartBIDataController"
 */
export interface getReportDataInfoQueryInterface {
  id?: string; // id
  shareId?: string; // shareId
}
export async function getReportDataInfo(params: getReportDataInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityBiShareResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/report-data/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * BI图数据
 * import { postReportDataList } from "/@/apis/gct-platform/ChartBIDataController"
 */
export async function postReportDataList(data: BIChartConditionDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitySqlResult['data']> {
  return request(
    {
      url: `/gct-platform/external/api/report-data/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * page详情
 * import { getReportDataPageInfo } from "/@/apis/gct-platform/ChartBIDataController"
 */
export interface getReportDataPageInfoQueryInterface {
  pageId: string; // pageId
}
export async function getReportDataPageInfo(params: getReportDataPageInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPnPageResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/report-data/page-info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * project详情
 * import { getReportDataProjectInfo } from "/@/apis/gct-platform/ChartBIDataController"
 */
export interface getReportDataProjectInfoQueryInterface {
  pageId: string; // pageId
  projectId: string; // projectId
}
export async function getReportDataProjectInfo(params: getReportDataProjectInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPnProjectResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/report-data/project-info`,
      method: 'get',
      params,
      ...config,
    },
  );
}