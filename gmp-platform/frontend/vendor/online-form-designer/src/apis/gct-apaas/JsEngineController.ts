import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject, ScriptExecuteRequest } from './model/index';

/**
 * 执行脚本服务
 * import { getJsEngineExecByKey } from "/@/apis/gct-apaas/JsEngineController"
 */
export interface getJsEngineExecByKeyPathInterface {
  key: string; // 脚本key
}
export interface getJsEngineExecByKeyQueryInterface {
  requestParam?: object; // requestParam
}
export async function getJsEngineExecByKey(path: getJsEngineExecByKeyPathInterface, params: getJsEngineExecByKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/js-engine/exec/${path?.key}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * POST执行脚本服务
 * import { postJsEngineExecByKey } from "/@/apis/gct-apaas/JsEngineController"
 */
export interface postJsEngineExecByKeyPathInterface {
  key: string; // 脚本key
}
export interface postJsEngineExecByKeyQueryInterface {
  requestParam?: object; // requestParam
}
export async function postJsEngineExecByKey(path: postJsEngineExecByKeyPathInterface, data: any, params: postJsEngineExecByKeyQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/js-engine/exec/${path?.key}`,
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
 * 脚本调试或直接执行
 * import { postJsEngineExecute } from "/@/apis/gct-apaas/JsEngineController"
 */
export async function postJsEngineExecute(data: ScriptExecuteRequest, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/js-engine/execute`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}