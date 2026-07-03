import request from '@mobile/utils/request';
import type { BizEventRequest, ResponseEntitystring, ResponseEntityBizEventResponse, ResponseEntityListBizEventResponse, ResponseEntityPageBaseBizEventResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 业务服务保存
 * import { postBizEvent } from "/@/apis/gct-apaas/BizEventController"
 */
export async function postBizEvent(data: BizEventRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-event`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 事件删除
 * import { deleteBizEvent } from "/@/apis/gct-apaas/BizEventController"
 */
export interface deleteBizEventQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBizEvent(params: deleteBizEventQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-event`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 业务服务详情
 * import { getBizEventInfo } from "/@/apis/gct-apaas/BizEventController"
 */
export interface getBizEventInfoQueryInterface {
  id: string; // id
}
export async function getBizEventInfo(params: getBizEventInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityBizEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-event/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 业务服务列表
 * import { getBizEventList } from "/@/apis/gct-apaas/BizEventController"
 */
export interface getBizEventListQueryInterface {
  modelKey: string; // 模型key
}
export async function getBizEventList(params: getBizEventListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListBizEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-event/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 业务服务分页列表
 * import { getBizEventPageList } from "/@/apis/gct-apaas/BizEventController"
 */
export interface getBizEventPageListQueryInterface {
  modelKey: string; // 模型key
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getBizEventPageList(params: getBizEventPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseBizEventResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-event/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putBizEventById } from "/@/apis/gct-apaas/BizEventController"
 */
export interface putBizEventByIdPathInterface {
  id: string; // id
}
export async function putBizEventById(path: putBizEventByIdPathInterface, data: BizEventRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-event/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}