import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * get通用接口
 * import { getViewModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/ViewModelBsController"
 */
export interface getViewModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface getViewModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function getViewModelBizServiceByModelKeyByBsKey(path: getViewModelBizServiceByModelKeyByBsKeyPathInterface, params: getViewModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * post通用接口
 * import { postViewModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/ViewModelBsController"
 */
export interface postViewModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface postViewModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postViewModelBizServiceByModelKeyByBsKey(path: postViewModelBizServiceByModelKeyByBsKeyPathInterface, data: undefined, params: postViewModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * put通用接口
 * import { putViewModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/ViewModelBsController"
 */
export interface putViewModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface putViewModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function putViewModelBizServiceByModelKeyByBsKey(path: putViewModelBizServiceByModelKeyByBsKeyPathInterface, data: undefined, params: putViewModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'put',
      params,
      data,
      ...config,
    },
  );
}

/**
 * delete通用接口
 * import { deleteViewModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/ViewModelBsController"
 */
export interface deleteViewModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface deleteViewModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function deleteViewModelBizServiceByModelKeyByBsKey(path: deleteViewModelBizServiceByModelKeyByBsKeyPathInterface, params: deleteViewModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}