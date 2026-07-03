import { defHttp } from '@/utils/http/axios';
import { AppGrantedUserRequest, ResponseEntitystring, AppGrantedUserBatchRequest, ResponseEntityAppGrantedStatisticDTO, ResponseEntityListUserResponse, ResponseEntityPageBaseUserResponse } from './model/index';

/**
 * 保存
 * import { postAppGrantedUser } from "/@/apis/gct-apaas/AppGrantedUserController"
 */
export async function postAppGrantedUser(data: AppGrantedUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-granted-user`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量保存
 * import { postAppGrantedUserBatch } from "/@/apis/gct-apaas/AppGrantedUserController"
 */
export async function postAppGrantedUserBatch(data: AppGrantedUserBatchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-granted-user/batch`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用授权统计信息
 * import { getAppGrantedUserGrantedStatistic } from "/@/apis/gct-apaas/AppGrantedUserController"
 */
export async function getAppGrantedUserGrantedStatistic(config = {}): Promise<ResponseEntityAppGrantedStatisticDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-granted-user/grantedStatistic`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppGrantedUserList } from "/@/apis/gct-apaas/AppGrantedUserController"
 */
export async function getAppGrantedUserList(config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-granted-user/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppGrantedUserPageList } from "/@/apis/gct-apaas/AppGrantedUserController"
 */
export interface getAppGrantedUserPageListQueryInterface {
  fullname?: string; // 姓名
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  searchTag?: number; // 普通查询0/授权用户1/共享用户2
  username?: string; // 用户名
}
export async function getAppGrantedUserPageList(params: getAppGrantedUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-granted-user/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 席位移除和转移
 * import { getAppGrantedUserRemoveAndTransfer } from "/@/apis/gct-apaas/AppGrantedUserController"
 */
export interface getAppGrantedUserRemoveAndTransferQueryInterface {
  sUserId: string; // 源用户id
  tUserId: string; // 目标用户id
}
export async function getAppGrantedUserRemoveAndTransfer(params: getAppGrantedUserRemoveAndTransferQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-granted-user/removeAndTransfer`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 未授权用户列表
 * import { getAppGrantedUserUngrantedList } from "/@/apis/gct-apaas/AppGrantedUserController"
 */
export async function getAppGrantedUserUngrantedList(config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-granted-user/ungranted/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}