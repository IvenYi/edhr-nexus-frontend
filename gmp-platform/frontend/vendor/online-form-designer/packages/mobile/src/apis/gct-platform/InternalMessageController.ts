import request from '@mobile/utils/request';
import type { InternalMessageRequest, ResponseEntitystring, ResponseEntityInternalMessageResponse, ResponseEntityListInternalMessageResponse, ResponseEntityPageBaseInternalMessageResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存消息记录
 * import { postInternalMessage } from "/@/apis/gct-platform/InternalMessageController"
 */
export async function postInternalMessage(data: InternalMessageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/internal-message`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getInternalMessageInfo } from "/@/apis/gct-platform/InternalMessageController"
 */
export interface getInternalMessageInfoQueryInterface {
  id: string; // id
}
export async function getInternalMessageInfo(params: getInternalMessageInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityInternalMessageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/internal-message/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getInternalMessageList } from "/@/apis/gct-platform/InternalMessageController"
 */
export interface getInternalMessageListQueryInterface {
  endTime?: string; // 截止时间
  startTime?: string; // 开始时间
  status?: string; // 消息状态 未读 UNREAD/全部 ALL
}
export async function getInternalMessageList(params: getInternalMessageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListInternalMessageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/internal-message/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 系统消息分页列表
 * import { getInternalMessagePageList } from "/@/apis/gct-platform/InternalMessageController"
 */
export interface getInternalMessagePageListQueryInterface {
  endTime?: string; // 截止时间
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  startTime?: string; // 开始时间
  status?: string; // 消息状态 未读 UNREAD/全部 ALL
}
export async function getInternalMessagePageList(params: getInternalMessagePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseInternalMessageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/internal-message/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 全部标记已读
 * import { putInternalMessageReadAll } from "/@/apis/gct-platform/InternalMessageController"
 */
export async function putInternalMessageReadAll(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/internal-message/read/all`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 单条消息标记已读
 * import { putInternalMessageReadById } from "/@/apis/gct-platform/InternalMessageController"
 */
export interface putInternalMessageReadByIdPathInterface {
  id: string; // 消息记录id
}
export async function putInternalMessageReadById(path: putInternalMessageReadByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/internal-message/read/${path?.id}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 未读消息数量
 * import { getInternalMessageUnreadCount } from "/@/apis/gct-platform/InternalMessageController"
 */
export async function getInternalMessageUnreadCount(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/internal-message/unread/count`,
      method: 'get',
      ...config,
    },
  );
}