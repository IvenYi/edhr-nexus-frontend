import request from '@mobile/utils/request';
import type { ReportRequest, ResponseEntitystring, ResponseEntityReportResponse, ResponseEntityLinkedHashMapstringListReport, ResponseEntityListReportResponse, ResponseEntityListModelReport, ResponseEntityListFieldMeta, ResponseEntityListSystemModelMeta, ResponseEntityPageBaseReportResponse, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postReport } from "/@/apis/gct-apaas/ReportController"
 */
export async function postReport(data: ReportRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteReport } from "/@/apis/gct-apaas/ReportController"
 */
export interface deleteReportQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteReport(params: deleteReportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 发布
 * import { postReportDeploy } from "/@/apis/gct-apaas/ReportController"
 */
export async function postReportDeploy(data: ReportRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/deploy`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getReportInfo } from "/@/apis/gct-apaas/ReportController"
 */
export interface getReportInfoQueryInterface {
  id: string; // id
}
export async function getReportInfo(params: getReportInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityReportResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 报表列表获取(按类型)
 * import { getReportInfos } from "/@/apis/gct-apaas/ReportController"
 */
export interface getReportInfosQueryInterface {
  appId?: string; // app id
  env?: string; // 环境
  type?: boolean; // true:按分类，false:按数据源
}
export async function getReportInfos(params: getReportInfosQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityLinkedHashMapstringListReport['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/infos`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getReportList } from "/@/apis/gct-apaas/ReportController"
 */
export async function getReportList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListReportResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 报表列表获取(按类型)
 * import { getReportListType } from "/@/apis/gct-apaas/ReportController"
 */
export interface getReportListTypePathInterface {
  type: boolean; // true:按分类，false:按数据源
}
export async function getReportListType(path: getReportListTypePathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityLinkedHashMapstringListReport['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/list/type`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取模型对应报表
 * import { getReportListModelReport } from "/@/apis/gct-apaas/ReportController"
 */
export interface getReportListModelReportQueryInterface {
  modelKey?: string; // modelKey
}
export async function getReportListModelReport(params: getReportListModelReportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelReport['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/listModelReport`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取系统模型对应字段
 * import { getReportListSystemModelFields } from "/@/apis/gct-apaas/ReportController"
 */
export interface getReportListSystemModelFieldsQueryInterface {
  modelKey: string; // modelKey
}
export async function getReportListSystemModelFields(params: getReportListSystemModelFieldsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFieldMeta['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/listSystemModelFields`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取系统模型
 * import { getReportListSystemModels } from "/@/apis/gct-apaas/ReportController"
 */
export async function getReportListSystemModels(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSystemModelMeta['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/listSystemModels`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 移动
 * import { putReportMove } from "/@/apis/gct-apaas/ReportController"
 */
export async function putReportMove(data: ReportRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/move`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postReportPageList } from "/@/apis/gct-apaas/ReportController"
 */
export async function postReportPageList(data: ReportRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseReportResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 取消发布
 * import { putReportUndeployById } from "/@/apis/gct-apaas/ReportController"
 */
export interface putReportUndeployByIdPathInterface {
  id: string; // id
}
export async function putReportUndeployById(path: putReportUndeployByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/undeploy/${path?.id}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 判断用户是否有报表权限
 * import { getReportUserPermissionById } from "/@/apis/gct-apaas/ReportController"
 */
export interface getReportUserPermissionByIdPathInterface {
  id: string; // 报表id
}
export async function getReportUserPermissionById(path: getReportUserPermissionByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/user/permission/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 看板分页列表
 * import { postReportViewPageList } from "/@/apis/gct-apaas/ReportController"
 */
export async function postReportViewPageList(data: ReportRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseReportResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/view/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putReportById } from "/@/apis/gct-apaas/ReportController"
 */
export interface putReportByIdPathInterface {
  id: string; // id
}
export async function putReportById(path: putReportByIdPathInterface, data: ReportRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/report/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}