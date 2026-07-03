import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject } from './model/index';

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
export async function getBizServiceByModelKeyByBsKey(path: getBizServiceByModelKeyByBsKeyPathInterface, params: getBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-service/${path?.modelKey}/${path?.bsKey}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postBizServiceByModelKeyByBsKey(path: postBizServiceByModelKeyByBsKeyPathInterface, data: any, params: postBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-service/${path?.modelKey}/${path?.bsKey}`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putBizServiceByModelKeyByBsKey(path: putBizServiceByModelKeyByBsKeyPathInterface, data: any, params: putBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/biz-service/${path?.modelKey}/${path?.bsKey}`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteBizServiceByModelKeyByBsKey(path: deleteBizServiceByModelKeyByBsKeyPathInterface, params: deleteBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/biz-service/${path?.modelKey}/${path?.bsKey}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}