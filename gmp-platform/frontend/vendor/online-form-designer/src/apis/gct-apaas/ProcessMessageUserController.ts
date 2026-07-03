import { defHttp } from '@/utils/http/axios';
import { ProcessMessageUserRequest, ResponseEntitystring, ResponseEntityProcessMessageUserResponse, ResponseEntityListProcessMessageUserResponse, ResponseEntityPageBaseProcessMessageUserResponse } from './model/index';

/**
 * 保存
 * import { postProcessMessageUser } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export async function postProcessMessageUser(data: ProcessMessageUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-message-user`,
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
 * import { deleteProcessMessageUser } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export interface deleteProcessMessageUserQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessMessageUser(params: deleteProcessMessageUserQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-message-user`,
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
 * import { getProcessMessageUserInfo } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export interface getProcessMessageUserInfoQueryInterface {
  id: string; // id
}
export async function getProcessMessageUserInfo(params: getProcessMessageUserInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessMessageUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-message-user/info`,
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
 * import { getProcessMessageUserList } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export async function getProcessMessageUserList(config = {}): Promise<ResponseEntityListProcessMessageUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-message-user/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessMessageUserPageList } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export interface getProcessMessageUserPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessMessageUserPageList(params: getProcessMessageUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessMessageUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-message-user/page/list`,
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
 * import { putProcessMessageUserById } from "/@/apis/gct-apaas/ProcessMessageUserController"
 */
export interface putProcessMessageUserByIdPathInterface {
  id: string; // id
}
export async function putProcessMessageUserById(path: putProcessMessageUserByIdPathInterface, data: ProcessMessageUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-message-user/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}