import { defHttp } from '@/utils/http/axios';
import { BizEventRequest, ResponseEntitystring, ResponseEntityBizEventResponse, ResponseEntityListBizEventResponse, ResponseEntityPageBaseBizEventResponse } from './model/index';

/**
 * 业务服务保存
 * import { postBizEvent } from "/@/apis/gct-apaas/BizEventController"
 */
export async function postBizEvent(data: BizEventRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-event`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 事件删除
 * import { deleteBizEvent } from "/@/apis/gct-apaas/BizEventController"
 */
export interface deleteBizEventQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBizEvent(params: deleteBizEventQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/biz-event`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 业务服务详情
 * import { getBizEventInfo } from "/@/apis/gct-apaas/BizEventController"
 */
export interface getBizEventInfoQueryInterface {
  id: string; // id
}
export async function getBizEventInfo(params: getBizEventInfoQueryInterface = {}, config = {}): Promise<ResponseEntityBizEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-event/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 业务服务列表
 * import { getBizEventList } from "/@/apis/gct-apaas/BizEventController"
 */
export interface getBizEventListQueryInterface {
  modelKey: string; // 模型key
}
export async function getBizEventList(params: getBizEventListQueryInterface = {}, config = {}): Promise<ResponseEntityListBizEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-event/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 业务服务分页列表
 * import { getBizEventPageList } from "/@/apis/gct-apaas/BizEventController"
 */
export interface getBizEventPageListQueryInterface {
  modelKey: string; // 模型key
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getBizEventPageList(params: getBizEventPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseBizEventResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-event/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putBizEventById } from "/@/apis/gct-apaas/BizEventController"
 */
export interface putBizEventByIdPathInterface {
  id: string; // id
}
export async function putBizEventById(path: putBizEventByIdPathInterface, data: BizEventRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/biz-event/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}