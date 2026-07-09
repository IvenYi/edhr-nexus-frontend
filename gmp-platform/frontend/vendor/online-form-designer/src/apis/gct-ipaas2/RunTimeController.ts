import { defHttp } from '@/utils/http/axios';
import { ResponseEntityboolean, ResponseEntity, DebugDTO } from './model/index';

/**
 * 销毁上下文
 * import { getRuntimeDestroyContext } from "/@/apis/gct-ipaas2/RunTimeController"
 */
export interface getRuntimeDestroyContextQueryInterface {
  clientId: string; // clientId
}
export async function getRuntimeDestroyContext(params: getRuntimeDestroyContextQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/runtime/destroyContext`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取随机id
 * import { getRuntimeRandomId } from "/@/apis/gct-ipaas2/RunTimeController"
 */
export async function getRuntimeRandomId(config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/runtime/randomId`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 重试
 * import { getRuntimeRetry } from "/@/apis/gct-ipaas2/RunTimeController"
 */
export interface getRuntimeRetryQueryInterface {
  reqId: string; // reqId
}
export async function getRuntimeRetry(params: getRuntimeRetryQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/runtime/retry`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 运行到指定节点
 * import { postRuntimeValidWebSocketAndRunToSpecNode } from "/@/apis/gct-ipaas2/RunTimeController"
 */
export async function postRuntimeValidWebSocketAndRunToSpecNode(data: DebugDTO, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/runtime/validWebSocketAndRunToSpecNode`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}