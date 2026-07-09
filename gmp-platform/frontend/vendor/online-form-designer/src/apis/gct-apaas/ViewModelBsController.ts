import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject } from './model/index';

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
export async function getViewModelBizServiceByModelKeyByBsKey(path: getViewModelBizServiceByModelKeyByBsKeyPathInterface, params: getViewModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/view-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
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
 * import { postViewModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/ViewModelBsController"
 */
export interface postViewModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface postViewModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postViewModelBizServiceByModelKeyByBsKey(path: postViewModelBizServiceByModelKeyByBsKeyPathInterface, data: any, params: postViewModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/view-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
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
 * import { putViewModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/ViewModelBsController"
 */
export interface putViewModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface putViewModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function putViewModelBizServiceByModelKeyByBsKey(path: putViewModelBizServiceByModelKeyByBsKeyPathInterface, data: any, params: putViewModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/view-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
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
 * import { deleteViewModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/ViewModelBsController"
 */
export interface deleteViewModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface deleteViewModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function deleteViewModelBizServiceByModelKeyByBsKey(path: deleteViewModelBizServiceByModelKeyByBsKeyPathInterface, params: deleteViewModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/view-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}