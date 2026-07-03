import request from '@mobile/utils/request';
import type { AppPublishLogRequest, ResponseEntitystring, ResponseEntityAppPublishLogResponse, ResponseEntityListAppPublishLogResponse, ResponseEntityPageBaseAppPublishLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAppPublishLog } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export async function postAppPublishLog(data: AppPublishLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-publish-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAppPublishLog } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export interface deleteAppPublishLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppPublishLog(params: deleteAppPublishLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-publish-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getAppPublishLogInfo } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export interface getAppPublishLogInfoQueryInterface {
  id: string; // id
}
export async function getAppPublishLogInfo(params: getAppPublishLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppPublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-publish-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppPublishLogList } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export async function getAppPublishLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppPublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-publish-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppPublishLogPageList } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export interface getAppPublishLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAppPublishLogPageList(params: getAppPublishLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAppPublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-publish-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppPublishLogById } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export interface putAppPublishLogByIdPathInterface {
  id: string; // id
}
export async function putAppPublishLogById(path: putAppPublishLogByIdPathInterface, data: AppPublishLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/app-publish-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}