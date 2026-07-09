import { defHttp } from '@/utils/http/axios';
import { OnlineFormTmplLogRequest, ResponseEntitystring, ResponseEntityOnlineFormTmplLogResponse, ResponseEntityListOnlineFormTmplLogResponse, ResponseEntityPageBaseOnlineFormTmplLogResponse } from './model/index';

/**
 * 保存
 * import { postOnlineFormTmplLog } from "/@/apis/gct-apaas/OnlineFormTmplLogController"
 */
export async function postOnlineFormTmplLog(data: OnlineFormTmplLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-tmpl-log`,
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
 * import { deleteOnlineFormTmplLog } from "/@/apis/gct-apaas/OnlineFormTmplLogController"
 */
export interface deleteOnlineFormTmplLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOnlineFormTmplLog(params: deleteOnlineFormTmplLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/online-form-tmpl-log`,
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
 * 详情
 * import { getOnlineFormTmplLogInfo } from "/@/apis/gct-apaas/OnlineFormTmplLogController"
 */
export interface getOnlineFormTmplLogInfoQueryInterface {
  id: string; // id
}
export async function getOnlineFormTmplLogInfo(params: getOnlineFormTmplLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineFormTmplLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-tmpl-log/info`,
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
 * import { getOnlineFormTmplLogList } from "/@/apis/gct-apaas/OnlineFormTmplLogController"
 */
export interface getOnlineFormTmplLogListQueryInterface {
  tmplId: string; // 模板ID
}
export async function getOnlineFormTmplLogList(params: getOnlineFormTmplLogListQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormTmplLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-tmpl-log/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOnlineFormTmplLogPageList } from "/@/apis/gct-apaas/OnlineFormTmplLogController"
 */
export interface getOnlineFormTmplLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  tmplId: string; // 模板ID
}
export async function getOnlineFormTmplLogPageList(params: getOnlineFormTmplLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineFormTmplLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-tmpl-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putOnlineFormTmplLogById } from "/@/apis/gct-apaas/OnlineFormTmplLogController"
 */
export interface putOnlineFormTmplLogByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormTmplLogById(path: putOnlineFormTmplLogByIdPathInterface, data: OnlineFormTmplLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/online-form-tmpl-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}