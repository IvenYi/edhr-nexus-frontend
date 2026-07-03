import { defHttp } from '@/utils/http/axios';
import { ResponseEntity, FlowUpdateReq, FlowActionReq } from './model/index';

/**
 * 连接流定义保存
 * import { postFlowDef } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export async function postFlowDef(data: any, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow/def`,
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
 * 获取连接流请求详情
 * import { getFlowLogByFuuidByReqId } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export interface getFlowLogByFuuidByReqIdPathInterface {
  fuuid: string; // 连接流id
  reqId: string; // 请求id
}
export async function getFlowLogByFuuidByReqId(path: getFlowLogByFuuidByReqIdPathInterface, config = {}): Promise<object['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/log/${path?.fuuid}/${path?.reqId}`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 更新连接流定义
 * import { putFlowDefByUuid } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export interface putFlowDefByUuidPathInterface {
  uuid: string; // ...
}
export async function putFlowDefByUuid(path: putFlowDefByUuidPathInterface, data: any, config = {}): Promise<object['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow/def/${path?.uuid}`,
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
 * 更新连接流
 * import { putFlowByFuuid } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export interface putFlowByFuuidPathInterface {
  fuuid: string; // ...
}
export async function putFlowByFuuid(path: putFlowByFuuidPathInterface, data: FlowUpdateReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow/${path?.fuuid}`,
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
 * 删除连接流
 * import { deleteFlowByFuuid } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export interface deleteFlowByFuuidPathInterface {
  fuuid: string; // ...
}
export async function deleteFlowByFuuid(path: deleteFlowByFuuidPathInterface, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.delete(
    {
      url: `/gct-ipaas/api/flow/${path?.fuuid}`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 获取连接流信息
 * import { getFlowByFuuid } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export interface getFlowByFuuidPathInterface {
  fuuid: string; // ...
}
export async function getFlowByFuuid(path: getFlowByFuuidPathInterface, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/${path?.fuuid}`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除连接流带版本
 * import { deleteFlowByFuuidVersionByVersion } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export interface deleteFlowByFuuidVersionByVersionPathInterface {
  fuuid: string; // ...
  version: string; // ...
}
export async function deleteFlowByFuuidVersionByVersion(path: deleteFlowByFuuidVersionByVersionPathInterface, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.delete(
    {
      url: `/gct-ipaas/api/flow/${path?.fuuid}/version/${path?.version}`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 连接流发布
 * import { putFlowPublish } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export async function putFlowPublish(data: FlowActionReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow/publish`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 连接流上线
 * import { putFlowOnline } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export async function putFlowOnline(data: FlowActionReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow/online`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 连接流下线
 * import { putFlowOffline } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export async function putFlowOffline(data: FlowActionReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow/offline`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取连接流定义
 * import { getFlowDefByFuuidByVersion } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export interface getFlowDefByFuuidByVersionPathInterface {
  fuuid: string; // ...
  version: string; // ...
}
export async function getFlowDefByFuuidByVersion(path: getFlowDefByFuuidByVersionPathInterface, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/def/${path?.fuuid}/${path?.version}`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 复制指定版本连接流
 * import { postFlowDefCopy } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export async function postFlowDefCopy(data: FlowActionReq, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow/def/copy`,
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
 * 连接流上下线
 * import { putFlowOnofflineByFuuid } from "/@/apis/gct-ipaas/IpaasDataFlowController"
 */
export interface putFlowOnofflineByFuuidPathInterface {
  fuuid: string; // ...
}
export async function putFlowOnofflineByFuuid(path: putFlowOnofflineByFuuidPathInterface, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow/onoffline/${path?.fuuid}`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}