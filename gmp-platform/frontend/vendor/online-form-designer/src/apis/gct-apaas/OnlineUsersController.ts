import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListClientsDto, ResponseEntityboolean, ResponseEntityOnlineUserSummary, ResponseEntityPageBaseOnlineUsersResponse } from './model/index';

/**
 * 获取在线客户端
 * import { getOnlineClients } from "/@/apis/gct-apaas/OnlineUsersController"
 */
export interface getOnlineClientsQueryInterface {
  appId: string; // appId
}
export async function getOnlineClients(params: getOnlineClientsQueryInterface = {}, config = {}): Promise<ResponseEntityListClientsDto['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online/clients`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 踢出
 * import { getOnlineExit } from "/@/apis/gct-apaas/OnlineUsersController"
 */
export interface getOnlineExitQueryInterface {
  clientId?: string; // clientId
}
export async function getOnlineExit(params: getOnlineExitQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online/exit`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取在线用户峰值数据
 * import { getOnlineMaxOnlineUser } from "/@/apis/gct-apaas/OnlineUsersController"
 */
export interface getOnlineMaxOnlineUserQueryInterface {
  detail?: boolean; // 返回详细数据
  endTime?: string; // 截止时间
  startTime?: string; // 开始时间
}
export async function getOnlineMaxOnlineUser(params: getOnlineMaxOnlineUserQueryInterface = {}, config = {}): Promise<ResponseEntityOnlineUserSummary['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online/maxOnlineUser`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 在线用户列表
 * import { getOnlinePageList } from "/@/apis/gct-apaas/OnlineUsersController"
 */
export interface getOnlinePageListQueryInterface {
  clientType?: string; // 客户端类型
  fullname?: string; // 姓名
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  userAuthType?: number; // 用户授权类型 0 授权用户 1被共享用户
  username?: string; // 账号
}
export async function getOnlinePageList(params: getOnlinePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOnlineUsersResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}