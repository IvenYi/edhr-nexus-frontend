import request from '@mobile/utils/request';
import type { RdoConditionDTO, ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 查询工作流 绑定的工艺数据
 * import { postBizServiceRefByKey } from "/@/apis/gct-apaas/BizServiceApiController"
 */
export interface postBizServiceRefByKeyPathInterface {
  key: string; // key
}
export async function postBizServiceRefByKey(path: postBizServiceRefByKeyPathInterface, data: RdoConditionDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/ref/${path?.key}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * get通用接口
 * import { getBizServiceByKeyByAction } from "/@/apis/gct-apaas/BizServiceApiController"
 */
export interface getBizServiceByKeyByActionPathInterface {
  action: string; // action
  key: string; // key
}
export interface getBizServiceByKeyByActionQueryInterface {
  request: object; // request
}
export async function getBizServiceByKeyByAction(path: getBizServiceByKeyByActionPathInterface, params: getBizServiceByKeyByActionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/${path?.key}/${path?.action}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * post通用接口
 * import { postBizServiceByKeyByAction } from "/@/apis/gct-apaas/BizServiceApiController"
 */
export interface postBizServiceByKeyByActionPathInterface {
  action: string; // action
  key: string; // key
}
export async function postBizServiceByKeyByAction(path: postBizServiceByKeyByActionPathInterface, data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/${path?.key}/${path?.action}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * put通用接口
 * import { putBizServiceByKeyByAction } from "/@/apis/gct-apaas/BizServiceApiController"
 */
export interface putBizServiceByKeyByActionPathInterface {
  action: string; // action
  key: string; // key
}
export interface putBizServiceByKeyByActionQueryInterface {
  request: object; // request
}
export async function putBizServiceByKeyByAction(path: putBizServiceByKeyByActionPathInterface, params: putBizServiceByKeyByActionQueryInterface = {}, data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/${path?.key}/${path?.action}`,
      method: 'put',
      params,
      data,
      ...config,
    },
  );
}

/**
 * delete通用接口
 * import { deleteBizServiceByKeyByAction } from "/@/apis/gct-apaas/BizServiceApiController"
 */
export interface deleteBizServiceByKeyByActionPathInterface {
  action: string; // action
  key: string; // key
}
export interface deleteBizServiceByKeyByActionQueryInterface {
  request: object; // request
}
export async function deleteBizServiceByKeyByAction(path: deleteBizServiceByKeyByActionPathInterface, params: deleteBizServiceByKeyByActionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-service/${path?.key}/${path?.action}`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}