import request from '@mobile/utils/request';
import type { ReportDataSetRequest, ResponseEntitystring, ExprDTO, ResponseEntityReportDataSetResponse, ResponseEntityListReportDataSetResponse, ReportConditionDTO, ResponseEntityModelPageableRow, ResponseEntityPageBaseReportDataSetResponse, ReportDataSetConditionDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postReportDataSet } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function postReportDataSet(data: ReportDataSetRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set`,
      method: 'post',
      data,
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
export async function deleteReportDataSet(params: deleteReportDataSetQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set`,
      method: 'delete',
      params,
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
export async function postReportDataSetGenColumn(data: ExprDTO, params: postReportDataSetGenColumnQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/gen-column`,
      method: 'post',
      params,
      data,
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
export async function getReportDataSetGenSql(params: getReportDataSetGenSqlQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/genSql`,
      method: 'get',
      params,
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
export async function getReportDataSetInfo(params: getReportDataSetInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityReportDataSetResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getReportDataSetList } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function getReportDataSetList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListReportDataSetResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 数据集分页查询
 * import { postReportDataSetListByPage4DataSet } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function postReportDataSetListByPage4DataSet(data: ReportConditionDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/listByPage4DataSet`,
      method: 'post',
      data,
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
export async function getReportDataSetPageList(params: getReportDataSetPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseReportDataSetResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 预览
 * import { postReportDataSetPreview } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function postReportDataSetPreview(data: ReportDataSetConditionDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelPageableRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/preview`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 名称修改
 * import { postReportDataSetUpdateName } from "/@/apis/gct-apaas/ReportDataSetController"
 */
export async function postReportDataSetUpdateName(data: ReportDataSetRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/updateName`,
      method: 'post',
      data,
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
export async function putReportDataSetById(path: putReportDataSetByIdPathInterface, data: ReportDataSetRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report-data-set/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}