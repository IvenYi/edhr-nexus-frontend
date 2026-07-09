import { defHttp } from '@/utils/http/axios';
import { FlowLogSearchReq, ResponseEntity, FlowNodeLogDetailReq } from './model/index';

/**
 * 连接流日志获取
 * import { getFlowLogPageList } from "/@/apis/gct-ipaas/IpaasLogController"
 */
export interface getFlowLogPageListQueryInterface {
  pageNo?: string; // 当前页
  pageSize?: string; // 当前条数
}
export async function getFlowLogPageList(params: getFlowLogPageListQueryInterface = {}, config = {}): Promise<object['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 连接流日志搜索
 * import { postFlowLogPageSearch } from "/@/apis/gct-ipaas/IpaasLogController"
 */
export interface postFlowLogPageSearchQueryInterface {
  pageNo?: string; // 页码
  pageSize?: string; // 每页数量
}
export async function postFlowLogPageSearch(data: FlowLogSearchReq, params: postFlowLogPageSearchQueryInterface = {}, config = {}): Promise<object['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow/log/page/search`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取日志详情
 * import { getFlowNodeLogByReqId } from "/@/apis/gct-ipaas/IpaasLogController"
 */
export interface getFlowNodeLogByReqIdPathInterface {
  reqId: string; // ...
}
export async function getFlowNodeLogByReqId(path: getFlowNodeLogByReqIdPathInterface, config = {}): Promise<object['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/node/log/${path?.reqId}`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取连接流上下线日志
 * import { getFlowOnlineByFuuid } from "/@/apis/gct-ipaas/IpaasLogController"
 */
export interface getFlowOnlineByFuuidPathInterface {
  fuuid: string; // ...
}
export interface getFlowOnlineByFuuidQueryInterface {
  pageNo?: string; // ...
  pageSize?: string; // ...
}
export async function getFlowOnlineByFuuid(path: getFlowOnlineByFuuidPathInterface, params: getFlowOnlineByFuuidQueryInterface = {}, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/online/${path?.fuuid}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取连接流节点日志详情
 * import { postFlowNodeLog } from "/@/apis/gct-ipaas/IpaasLogController"
 */
export async function postFlowNodeLog(data: FlowNodeLogDetailReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow/node/log`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取连接流节点日志详情输入输出
 * import { postFlowNodeLogIo } from "/@/apis/gct-ipaas/IpaasLogController"
 */
export async function postFlowNodeLogIo(data: FlowNodeLogDetailReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow/node/log/io`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取连接流调用方式
 * import { getFlowInvokeMethods } from "/@/apis/gct-ipaas/IpaasLogController"
 */
export async function getFlowInvokeMethods(config = {}): Promise<object['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/invoke/methods`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取连接流调用结果
 * import { getFlowInvokeStatus } from "/@/apis/gct-ipaas/IpaasLogController"
 */
export async function getFlowInvokeStatus(config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/invoke/status`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}