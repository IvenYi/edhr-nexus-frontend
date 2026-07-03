import { defHttp } from '@/utils/http/axios';
import { ResponseEntityImportReportResponse, ResponseEntityListImportReportResponse, ResponseEntityPageBaseImportReportResponse } from './model/index';

/**
 * 详情
 * import { getImportReportInfo } from "/@/apis/gct-apaas/ImportReportController"
 */
export interface getImportReportInfoQueryInterface {
  id: string; // id
}
export async function getImportReportInfo(params: getImportReportInfoQueryInterface = {}, config = {}): Promise<ResponseEntityImportReportResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/import-report/info`,
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
 * import { getImportReportList } from "/@/apis/gct-apaas/ImportReportController"
 */
export async function getImportReportList(config = {}): Promise<ResponseEntityListImportReportResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/import-report/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getImportReportPageList(params: getImportReportPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseImportReportResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/import-report/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}