import request from '@mobile/utils/request';
import type { MessageRecordRequest, ResponseEntitystring, ResponseEntityMessageRecordResponse, ResponseEntityListMessageRecordResponse, ResponseEntityPageBaseMessageRecordResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postMessageRecord } from "/@/apis/gct-apaas/MessageRecordController"
 */
export async function postMessageRecord(data: MessageRecordRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-record`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteMessageRecord } from "/@/apis/gct-apaas/MessageRecordController"
 */
export interface deleteMessageRecordQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMessageRecord(params: deleteMessageRecordQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-record`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getMessageRecordInfo } from "/@/apis/gct-apaas/MessageRecordController"
 */
export interface getMessageRecordInfoQueryInterface {
  id: string; // id
}
export async function getMessageRecordInfo(params: getMessageRecordInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMessageRecordResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-record/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getMessageRecordList } from "/@/apis/gct-apaas/MessageRecordController"
 */
export async function getMessageRecordList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListMessageRecordResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-record/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMessageRecordPageList } from "/@/apis/gct-apaas/MessageRecordController"
 */
export interface getMessageRecordPageListQueryInterface {
  endTime?: string; // endTime
  formSerialNo?: string; // formSerialNo
  modelName?: string; // modelName
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  pushType?: string; // pushType
  result?: string; // result
  startTime?: string; // startTime
  tmplKey?: string; // tmplKey
  tmplName?: string; // tmplName
  userId?: string; // userId
  userName?: string; // userName
}
export async function getMessageRecordPageList(params: getMessageRecordPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseMessageRecordResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-record/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}