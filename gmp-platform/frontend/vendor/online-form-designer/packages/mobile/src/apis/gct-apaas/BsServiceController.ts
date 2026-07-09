import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * get通用接口
 * import { getBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/BsServiceController"
 */
export interface getBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface getBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function getBizServiceByModelKeyByBsKey(path: getBizServiceByModelKeyByBsKeyPathInterface, params: getBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * post通用接口
 * import { postBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/BsServiceController"
 */
export interface postBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface postBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postBizServiceByModelKeyByBsKey(path: postBizServiceByModelKeyByBsKeyPathInterface, data: undefined, params: postBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * put通用接口
 * import { putBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/BsServiceController"
 */
export interface putBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface putBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function putBizServiceByModelKeyByBsKey(path: putBizServiceByModelKeyByBsKeyPathInterface, data: undefined, params: putBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'put',
      params,
      data,
      ...config,
    },
  );
}

/**
 * delete通用接口
 * import { deleteBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/BsServiceController"
 */
export interface deleteBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface deleteBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function deleteBizServiceByModelKeyByBsKey(path: deleteBizServiceByModelKeyByBsKeyPathInterface, params: deleteBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}