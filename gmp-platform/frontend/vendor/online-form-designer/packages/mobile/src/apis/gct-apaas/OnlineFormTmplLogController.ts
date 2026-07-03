import request from '@mobile/utils/request';
import type { OnlineFormTmplLogRequest, ResponseEntitystring, ResponseEntityOnlineFormTmplLogResponse, ResponseEntityListOnlineFormTmplLogResponse, ResponseEntityPageBaseOnlineFormTmplLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postOnlineFormTmplLog } from "/@/apis/gct-apaas/OnlineFormTmplLogController"
 */
export async function postOnlineFormTmplLog(data: OnlineFormTmplLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl-log`,
      method: 'post',
      data,
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
export async function deleteOnlineFormTmplLog(params: deleteOnlineFormTmplLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl-log`,
      method: 'delete',
      params,
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
export async function getOnlineFormTmplLogInfo(params: getOnlineFormTmplLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineFormTmplLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl-log/info`,
      method: 'get',
      params,
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
export async function getOnlineFormTmplLogList(params: getOnlineFormTmplLogListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormTmplLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl-log/list`,
      method: 'get',
      params,
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
export async function getOnlineFormTmplLogPageList(params: getOnlineFormTmplLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOnlineFormTmplLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl-log/page/list`,
      method: 'get',
      params,
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
export async function putOnlineFormTmplLogById(path: putOnlineFormTmplLogByIdPathInterface, data: OnlineFormTmplLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}