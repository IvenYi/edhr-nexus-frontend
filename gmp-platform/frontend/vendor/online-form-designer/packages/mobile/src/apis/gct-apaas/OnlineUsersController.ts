import request from '@mobile/utils/request';
import type { ResponseEntityListClientsDto, ResponseEntityboolean, ResponseEntityOnlineUserSummary, ResponseEntityPageBaseOnlineUsersResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取在线客户端
 * import { getOnlineClients } from "/@/apis/gct-apaas/OnlineUsersController"
 */
export interface getOnlineClientsQueryInterface {
  appId: string; // appId
}
export async function getOnlineClients(params: getOnlineClientsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListClientsDto['data']> {
  return request(
    {
      url: `/gct-apaas/api/online/clients`,
      method: 'get',
      params,
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
export async function getOnlineExit(params: getOnlineExitQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/online/exit`,
      method: 'get',
      params,
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
export async function getOnlineMaxOnlineUser(params: getOnlineMaxOnlineUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineUserSummary['data']> {
  return request(
    {
      url: `/gct-apaas/api/online/maxOnlineUser`,
      method: 'get',
      params,
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
export async function getOnlinePageList(params: getOnlinePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOnlineUsersResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}