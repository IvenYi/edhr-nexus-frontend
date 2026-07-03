import { defHttp } from '@/utils/http/axios';
import { ReportDataSetRequest, ResponseEntitystring, ExprDTO, ResponseEntityReportDataSetResponse, ResponseEntityListReportDataSetResponse, ReportConditionDTO, ResponseEntityModelPageableRow, ResponseEntityPageBaseReportDataSetResponse, ReportDataSetConditionDTO } from './model/index';

/**
 * 保存
 * import { postReportDataSet } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function postReportDataSet(data: ReportDataSetRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report-data-set`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteReportDataSet } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export interface deleteReportDataSetQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteReportDataSet(params: deleteReportDataSetQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/report-data-set`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 函数生成新字段
 * import { postReportDataSetGenColumn } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export interface postReportDataSetGenColumnQueryInterface {
  fileUpload?: boolean; // 数据集是否是本地上传
}
export async function postReportDataSetGenColumn(data: ExprDTO, params: postReportDataSetGenColumnQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report-data-set/gen-column`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 生成sql
 * import { getReportDataSetGenSql } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export interface getReportDataSetGenSqlQueryInterface {
  id: string; // id
}
export async function getReportDataSetGenSql(params: getReportDataSetGenSqlQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report-data-set/genSql`,
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
 * import { getReportDataSetInfo } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export interface getReportDataSetInfoQueryInterface {
  id: string; // id
}
export async function getReportDataSetInfo(params: getReportDataSetInfoQueryInterface = {}, config = {}): Promise<ResponseEntityReportDataSetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report-data-set/info`,
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
 * import { getReportDataSetList } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function getReportDataSetList(config = {}): Promise<ResponseEntityListReportDataSetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report-data-set/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 数据集分页查询
 * import { postReportDataSetListByPage4DataSet } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function postReportDataSetListByPage4DataSet(data: ReportConditionDTO, config = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report-data-set/listByPage4DataSet`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getReportDataSetPageList } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export interface getReportDataSetPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getReportDataSetPageList(params: getReportDataSetPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseReportDataSetResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report-data-set/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 预览
 * import { postReportDataSetPreview } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function postReportDataSetPreview(data: ReportDataSetConditionDTO, config = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report-data-set/preview`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 名称修改
 * import { postReportDataSetUpdateName } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function postReportDataSetUpdateName(data: ReportDataSetRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report-data-set/updateName`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putReportDataSetById } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export interface putReportDataSetByIdPathInterface {
  id: string; // id
}
export async function putReportDataSetById(path: putReportDataSetByIdPathInterface, data: ReportDataSetRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/report-data-set/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}