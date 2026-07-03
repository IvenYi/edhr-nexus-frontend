import { defHttp } from '@/utils/http/axios';
import { BIChartExportDTO, ResponseEntityBiShareResponse, BIChartConditionDTO, ResponseEntitySqlResult, ResponseEntityPnPageResponse, ResponseEntityPnProjectResponse } from './model/index';

/**
 * 图数据导出
 * import { postReportDataExportExternal } from "/@/apis/gct-platform/ChartBIDataController"
 */
export async function postReportDataExportExternal(data: BIChartExportDTO, config = {}): Promise<string> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/report-data/export`,
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
 * import { getReportDataInfoExternal } from "/@/apis/gct-platform/ChartBIDataController"
 */
export interface getReportDataInfoExternalQueryInterface {
  id?: string; // id
  shareId?: string; // shareId
}
export async function getReportDataInfoExternal(params: getReportDataInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityBiShareResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/report-data/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * BI图数据
 * import { postReportDataListExternal } from "/@/apis/gct-platform/ChartBIDataController"
 */
export async function postReportDataListExternal(data: BIChartConditionDTO, config = {}): Promise<ResponseEntitySqlResult['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/report-data/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * page详情
 * import { getReportDataPageInfoExternal } from "/@/apis/gct-platform/ChartBIDataController"
 */
export interface getReportDataPageInfoExternalQueryInterface {
  pageId: string; // pageId
}
export async function getReportDataPageInfoExternal(params: getReportDataPageInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityPnPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/report-data/page-info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * project详情
 * import { getReportDataProjectInfoExternal } from "/@/apis/gct-platform/ChartBIDataController"
 */
export interface getReportDataProjectInfoExternalQueryInterface {
  pageId: string; // pageId
  projectId: string; // projectId
}
export async function getReportDataProjectInfoExternal(params: getReportDataProjectInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityPnProjectResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/report-data/project-info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}