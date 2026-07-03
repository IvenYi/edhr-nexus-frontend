import { defHttp } from '@/utils/http/axios';
import { ResponseEntityboolean, ResponseEntity, DebugDTO, ResponseEntitySchemaObject } from './model/index';

/**
 * 创建
 * import { postCamelCreate } from "/@/apis/gct-ipaas2/CamelController"
 */
export async function postCamelCreate(data: any, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/camel/create`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 同步调试
 * import { getCamelData } from "/@/apis/gct-ipaas2/CamelController"
 */
export interface getCamelDataQueryInterface {
  num?: number; // num
}
export async function getCamelData(params: getCamelDataQueryInterface = {}, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/camel/data`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 同步调试
 * import { postCamelDebug } from "/@/apis/gct-ipaas2/CamelController"
 */
export async function postCamelDebug(data: DebugDTO, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/camel/debug`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 销毁
 * import { postCamelDestory } from "/@/apis/gct-ipaas2/CamelController"
 */
export interface postCamelDestoryQueryInterface {
  flowId: string; // flowId
  version: string; // version
}
export async function postCamelDestory(params: postCamelDestoryQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/camel/destory`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取缺失的参数key
 * import { postCamelFetchMissingParams } from "/@/apis/gct-ipaas2/CamelController"
 */
export interface postCamelFetchMissingParamsQueryInterface {
  flowId: string; // flowId
}
export async function postCamelFetchMissingParams(data: any, params: postCamelFetchMissingParamsQueryInterface = {}, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/camel/fetchMissingParams`,
      params,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取所有的路由定义
 * import { getCamelRoutes } from "/@/apis/gct-ipaas2/CamelController"
 */
export async function getCamelRoutes(config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/camel/routes`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * schema转换
 * import { getCamelSchema } from "/@/apis/gct-ipaas2/CamelController"
 */
export interface getCamelSchemaQueryInterface {
  flowId: string; // flowId
}
export async function getCamelSchema(params: getCamelSchemaQueryInterface = {}, config = {}): Promise<ResponseEntitySchemaObject['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/camel/schema`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}