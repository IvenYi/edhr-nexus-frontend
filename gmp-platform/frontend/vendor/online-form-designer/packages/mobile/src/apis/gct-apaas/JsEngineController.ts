import request from '@mobile/utils/request';
import type { ResponseEntityobject, ScriptExecuteRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

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
export async function getJsEngineExecByKey(path: getJsEngineExecByKeyPathInterface, params: getJsEngineExecByKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/js-engine/exec/${path?.key}`,
      method: 'get',
      params,
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
export async function postJsEngineExecByKey(path: postJsEngineExecByKeyPathInterface, data: undefined, params: postJsEngineExecByKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/js-engine/exec/${path?.key}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 脚本调试或直接执行
 * import { postJsEngineExecute } from "/@/apis/gct-apaas/JsEngineController"
 */
export async function postJsEngineExecute(data: ScriptExecuteRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/js-engine/execute`,
      method: 'post',
      data,
      ...config,
    },
  );
}