import { defHttp } from '@/utils/http/axios';
import { InternalMessageRequest, ResponseEntitystring, ResponseEntityInternalMessageResponse, ResponseEntityListInternalMessageResponse, ResponseEntityPageBaseInternalMessageResponse } from './model/index';

/**
 * 保存消息记录
 * import { postInternalMessage } from "/@/apis/gct-platform/InternalMessageController"
 */
export async function postInternalMessage(data: InternalMessageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/internal-message`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getInternalMessageInfo } from "/@/apis/gct-platform/InternalMessageController"
 */
export interface getInternalMessageInfoQueryInterface {
  id: string; // id
}
export async function getInternalMessageInfo(params: getInternalMessageInfoQueryInterface = {}, config = {}): Promise<ResponseEntityInternalMessageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/internal-message/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getInternalMessageList } from "/@/apis/gct-platform/InternalMessageController"
 */
export interface getInternalMessageListQueryInterface {
  endTime?: string; // 截止时间
  startTime?: string; // 开始时间
  status?: string; // 消息状态 未读 UNREAD/全部 ALL
}
export async function getInternalMessageList(params: getInternalMessageListQueryInterface = {}, config = {}): Promise<ResponseEntityListInternalMessageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/internal-message/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 系统消息分页列表
 * import { getInternalMessagePageList } from "/@/apis/gct-platform/InternalMessageController"
 */
export interface getInternalMessagePageListQueryInterface {
  endTime?: string; // 截止时间
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  startTime?: string; // 开始时间
  status?: string; // 消息状态 未读 UNREAD/全部 ALL
}
export async function getInternalMessagePageList(params: getInternalMessagePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseInternalMessageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/internal-message/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 全部标记已读
 * import { putInternalMessageReadAll } from "/@/apis/gct-platform/InternalMessageController"
 */
export async function putInternalMessageReadAll(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/internal-message/read/all`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 单条消息标记已读
 * import { putInternalMessageReadById } from "/@/apis/gct-platform/InternalMessageController"
 */
export interface putInternalMessageReadByIdPathInterface {
  id: string; // 消息记录id
}
export async function putInternalMessageReadById(path: putInternalMessageReadByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/internal-message/read/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 未读消息数量
 * import { getInternalMessageUnreadCount } from "/@/apis/gct-platform/InternalMessageController"
 */
export async function getInternalMessageUnreadCount(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/internal-message/unread/count`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}