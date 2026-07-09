import { defHttp } from '@/utils/http/axios';
import { UserInfoLogRequest, ResponseEntitystring, ResponseEntityUserInfoLogResponse, ResponseEntityListUserInfoLogResponse, ResponseEntityPageBaseUserInfoLogResponse } from './model/index';

/**
 * 保存
 * import { postUserInfoLog } from "/@/apis/gct-platform/UserInfoLogController"
 */
export async function postUserInfoLog(data: UserInfoLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user-info-log`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteUserInfoLog } from "/@/apis/gct-platform/UserInfoLogController"
 */
export interface deleteUserInfoLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteUserInfoLog(params: deleteUserInfoLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/user-info-log`,
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
 * 详情
 * import { getUserInfoLogInfo } from "/@/apis/gct-platform/UserInfoLogController"
 */
export interface getUserInfoLogInfoQueryInterface {
  id: string; // id
}
export async function getUserInfoLogInfo(params: getUserInfoLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityUserInfoLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user-info-log/info`,
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
 * import { getUserInfoLogList } from "/@/apis/gct-platform/UserInfoLogController"
 */
export async function getUserInfoLogList(config = {}): Promise<ResponseEntityListUserInfoLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user-info-log/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getUserInfoLogPageList } from "/@/apis/gct-platform/UserInfoLogController"
 */
export interface getUserInfoLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  userId?: string; // 用户id
}
export async function getUserInfoLogPageList(params: getUserInfoLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseUserInfoLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user-info-log/page/list`,
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
 * import { putUserInfoLogById } from "/@/apis/gct-platform/UserInfoLogController"
 */
export interface putUserInfoLogByIdPathInterface {
  id: string; // id
}
export async function putUserInfoLogById(path: putUserInfoLogByIdPathInterface, data: UserInfoLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/user-info-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}