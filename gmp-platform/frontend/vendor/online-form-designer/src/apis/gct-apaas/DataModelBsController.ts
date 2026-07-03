import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject } from './model/index';

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
export async function getDataModelBizServiceByModelKeyByBsKey(path: getDataModelBizServiceByModelKeyByBsKeyPathInterface, params: getDataModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/data-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
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
 * import { postDataModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/DataModelBsController"
 */
export interface postDataModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface postDataModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postDataModelBizServiceByModelKeyByBsKey(path: postDataModelBizServiceByModelKeyByBsKeyPathInterface, data: any, params: postDataModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/data-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
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
 * import { putDataModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/DataModelBsController"
 */
export interface putDataModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface putDataModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function putDataModelBizServiceByModelKeyByBsKey(path: putDataModelBizServiceByModelKeyByBsKeyPathInterface, data: any, params: putDataModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/data-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
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
 * import { deleteDataModelBizServiceByModelKeyByBsKey } from "/@/apis/gct-apaas/DataModelBsController"
 */
export interface deleteDataModelBizServiceByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelKey: string; // modelKey
}
export interface deleteDataModelBizServiceByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function deleteDataModelBizServiceByModelKeyByBsKey(path: deleteDataModelBizServiceByModelKeyByBsKeyPathInterface, params: deleteDataModelBizServiceByModelKeyByBsKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/data-model/biz-service/${path?.modelKey}/${path?.bsKey}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}