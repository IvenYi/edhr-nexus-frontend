import request from '@mobile/utils/request';
import type { MessageTmplLogRequest, ResponseEntitystring, ResponseEntityListMessageTmplLogResponse, ResponseEntityPageBaseMessageTmplLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postMessageTmplLog } from "/@/apis/gct-apaas/MessageTmplLogController"
 */
export async function postMessageTmplLog(data: MessageTmplLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteMessageTmplLog } from "/@/apis/gct-apaas/MessageTmplLogController"
 */
export interface deleteMessageTmplLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMessageTmplLog(params: deleteMessageTmplLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 列表
 * import { getMessageTmplLogList } from "/@/apis/gct-apaas/MessageTmplLogController"
 */
export async function getMessageTmplLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListMessageTmplLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMessageTmplLogPageList } from "/@/apis/gct-apaas/MessageTmplLogController"
 */
export interface getMessageTmplLogPageListQueryInterface {
  key?: string; // key
  modelName?: string; // modelName
  name?: string; // name
  opened?: number; // opened
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  type?: string; // type
}
export async function getMessageTmplLogPageList(params: getMessageTmplLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseMessageTmplLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}