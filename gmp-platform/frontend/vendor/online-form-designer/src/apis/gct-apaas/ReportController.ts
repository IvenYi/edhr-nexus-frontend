import { defHttp } from '@/utils/http/axios';
import { ReportRequest, ResponseEntitystring, ResponseEntityReportResponse, ResponseEntityLinkedHashMapstringListReport, ResponseEntityListReportResponse, ResponseEntityListModelReport, ResponseEntityListFieldMeta, ResponseEntityListSystemModelMeta, ResponseEntityPageBaseReportResponse, ResponseEntityboolean } from './model/index';

/**
 * 保存
 * import { postReport } from "/@/apis/gct-apaas/ReportController"
 */
export async function postReport(data: ReportRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report`,
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
 * import { deleteReport } from "/@/apis/gct-apaas/ReportController"
 */
export interface deleteReportQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteReport(params: deleteReportQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/report`,
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
 * 发布
 * import { postReportDeploy } from "/@/apis/gct-apaas/ReportController"
 */
export async function postReportDeploy(data: ReportRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report/deploy`,
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
 * import { getReportInfo } from "/@/apis/gct-apaas/ReportController"
 */
export interface getReportInfoQueryInterface {
  id: string; // id
}
export async function getReportInfo(params: getReportInfoQueryInterface = {}, config = {}): Promise<ResponseEntityReportResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getReportInfos(params: getReportInfosQueryInterface = {}, config = {}): Promise<ResponseEntityLinkedHashMapstringListReport['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report/infos`,
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
 * import { getReportList } from "/@/apis/gct-apaas/ReportController"
 */
export async function getReportList(config = {}): Promise<ResponseEntityListReportResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getReportListType(path: getReportListTypePathInterface, config = {}): Promise<ResponseEntityLinkedHashMapstringListReport['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report/list/type`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getReportListModelReport(params: getReportListModelReportQueryInterface = {}, config = {}): Promise<ResponseEntityListModelReport['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report/listModelReport`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getReportListSystemModelFields(params: getReportListSystemModelFieldsQueryInterface = {}, config = {}): Promise<ResponseEntityListFieldMeta['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report/listSystemModelFields`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取系统模型
 * import { getReportListSystemModels } from "/@/apis/gct-apaas/ReportController"
 */
export async function getReportListSystemModels(config = {}): Promise<ResponseEntityListSystemModelMeta['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report/listSystemModels`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移动
 * import { putReportMove } from "/@/apis/gct-apaas/ReportController"
 */
export async function putReportMove(data: ReportRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/report/move`,
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
 * import { postReportPageList } from "/@/apis/gct-apaas/ReportController"
 */
export async function postReportPageList(data: ReportRequest, config = {}): Promise<ResponseEntityPageBaseReportResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putReportUndeployById(path: putReportUndeployByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/report/undeploy/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getReportUserPermissionById(path: getReportUserPermissionByIdPathInterface, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/report/user/permission/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 看板分页列表
 * import { postReportViewPageList } from "/@/apis/gct-apaas/ReportController"
 */
export async function postReportViewPageList(data: ReportRequest, config = {}): Promise<ResponseEntityPageBaseReportResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/report/view/page/list`,
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
 * import { putReportById } from "/@/apis/gct-apaas/ReportController"
 */
export interface putReportByIdPathInterface {
  id: string; // id
}
export async function putReportById(path: putReportByIdPathInterface, data: ReportRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/report/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}