import request from '@mobile/utils/request';
import type { MessageTmplRequest, ResponseEntitystring, ResponseEntityListMessageTmplResponse, MessageTmplOpenedRequest, ResponseEntityPageBaseMessageTmplResponse, MessageTmplSendRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postMessageTmpl } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function postMessageTmpl(data: MessageTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteMessageTmpl } from "/@/apis/gct-apaas/MessageTmplController"
 */
export interface deleteMessageTmplQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMessageTmpl(params: deleteMessageTmplQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 列表
 * import { getMessageTmplList } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function getMessageTmplList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListMessageTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 通过模型key筛选消息模板
 * import { getMessageTmplListByModelKey } from "/@/apis/gct-apaas/MessageTmplController"
 */
export interface getMessageTmplListByModelKeyQueryInterface {
  modelKey: string; // modelKey
}
export async function getMessageTmplListByModelKey(params: getMessageTmplListByModelKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMessageTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl/listByModelKey`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 公开和不公开
 * import { putMessageTmplOpened } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function putMessageTmplOpened(data: MessageTmplOpenedRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl/opened`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMessageTmplPageList } from "/@/apis/gct-apaas/MessageTmplController"
 */
export interface getMessageTmplPageListQueryInterface {
  key?: string; // key
  modelName?: string; // modelName
  name?: string; // name
  opened?: number; // opened
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  type?: string; // type
}
export async function getMessageTmplPageList(params: getMessageTmplPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseMessageTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 审核流程发送消息
 * import { postMessageTmplProcessSend } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function postMessageTmplProcessSend(data: MessageTmplSendRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl/processSend`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 测试发送消息
 * import { postMessageTmplSend } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function postMessageTmplSend(data: MessageTmplSendRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl/send`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putMessageTmplById } from "/@/apis/gct-apaas/MessageTmplController"
 */
export interface putMessageTmplByIdPathInterface {
  id: string; // id
}
export async function putMessageTmplById(path: putMessageTmplByIdPathInterface, data: MessageTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/message-tmpl/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}