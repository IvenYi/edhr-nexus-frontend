import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * get通用接口
 * import { getDataModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/DataModelBsController"
 */
export interface getDataModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface getDataModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function getDataModelBizServiceByModelKeyByBsKey(path: getDataModelBizServiceByModelKeyByBsKeyPathInterface, params: getDataModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * post通用接口
 * import { postDataModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/DataModelBsController"
 */
export interface postDataModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface postDataModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postDataModelBizServiceByModelKeyByBsKey(path: postDataModelBizServiceByModelKeyByBsKeyPathInterface, data: undefined, params: postDataModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * put通用接口
 * import { putDataModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/DataModelBsController"
 */
export interface putDataModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface putDataModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function putDataModelBizServiceByModelKeyByBsKey(path: putDataModelBizServiceByModelKeyByBsKeyPathInterface, data: undefined, params: putDataModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'put',
      params,
      data,
      ...config,
    },
  );
}

/**
 * delete通用接口
 * import { deleteDataModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/DataModelBsController"
 */
export interface deleteDataModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface deleteDataModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function deleteDataModelBizServiceByModelKeyByBsKey(path: deleteDataModelBizServiceByModelKeyByBsKeyPathInterface, params: deleteDataModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}