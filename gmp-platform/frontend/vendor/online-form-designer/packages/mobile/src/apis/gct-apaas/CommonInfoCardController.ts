import request from '@mobile/utils/request';
import type { CommonInfoCardRequest, ResponseEntitystring, ResponseEntityCommonInfoCardResponse, ResponseEntityListCommonInfoCardResponse, ResponseEntityPageBaseCommonInfoCardResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postCommonInfoCard } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export async function postCommonInfoCard(data: CommonInfoCardRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/common-info-card`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteCommonInfoCard } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export interface deleteCommonInfoCardQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCommonInfoCard(params: deleteCommonInfoCardQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/common-info-card`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 查找信息卡
 * import { getCommonInfoCardGetById } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export interface getCommonInfoCardGetByIdQueryInterface {
  id: string; // id
  modelKey: string; // modelKey
  type: string; // type
}
export async function getCommonInfoCardGetById(params: getCommonInfoCardGetByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityCommonInfoCardResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/common-info-card/getById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getCommonInfoCardInfo } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export interface getCommonInfoCardInfoQueryInterface {
  id: string; // id
}
export async function getCommonInfoCardInfo(params: getCommonInfoCardInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityCommonInfoCardResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/common-info-card/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { postCommonInfoCardList } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export async function postCommonInfoCardList(data: CommonInfoCardRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCommonInfoCardResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/common-info-card/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postCommonInfoCardPageList } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export async function postCommonInfoCardPageList(data: CommonInfoCardRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseCommonInfoCardResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/common-info-card/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 名称修改
 * import { postCommonInfoCardUpdateName } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export async function postCommonInfoCardUpdateName(data: CommonInfoCardRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/common-info-card/updateName`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putCommonInfoCardById } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export interface putCommonInfoCardByIdPathInterface {
  id: string; // id
}
export async function putCommonInfoCardById(path: putCommonInfoCardByIdPathInterface, data: CommonInfoCardRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/common-info-card/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}