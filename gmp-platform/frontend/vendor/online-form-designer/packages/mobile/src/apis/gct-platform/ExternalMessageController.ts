import request from '@mobile/utils/request';
import type { ExternalMessageRequest, ResponseEntitystring, ResponseEntityExternalMessageResponse, ResponseEntityListExternalMessageResponse, ResponseEntityPageBaseExternalMessageResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postExternalMessage } from "/@/apis/gct-platform/ExternalMessageController"
 */
export async function postExternalMessage(data: ExternalMessageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/external-message`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteExternalMessage } from "/@/apis/gct-platform/ExternalMessageController"
 */
export interface deleteExternalMessageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteExternalMessage(params: deleteExternalMessageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/external-message`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getExternalMessageInfo } from "/@/apis/gct-platform/ExternalMessageController"
 */
export interface getExternalMessageInfoQueryInterface {
  id: string; // id
}
export async function getExternalMessageInfo(params: getExternalMessageInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityExternalMessageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/external-message/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getExternalMessageList } from "/@/apis/gct-platform/ExternalMessageController"
 */
export async function getExternalMessageList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListExternalMessageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/external-message/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getExternalMessagePageList } from "/@/apis/gct-platform/ExternalMessageController"
 */
export interface getExternalMessagePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getExternalMessagePageList(params: getExternalMessagePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseExternalMessageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/external-message/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putExternalMessageById } from "/@/apis/gct-platform/ExternalMessageController"
 */
export interface putExternalMessageByIdPathInterface {
  id: string; // id
}
export async function putExternalMessageById(path: putExternalMessageByIdPathInterface, data: ExternalMessageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/external-message/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}