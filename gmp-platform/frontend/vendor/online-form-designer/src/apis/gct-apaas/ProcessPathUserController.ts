import { defHttp } from '@/utils/http/axios';
import { ProcessPathUserRequest, ResponseEntitystring, ResponseEntityProcessPathUserResponse, ResponseEntityListProcessPathUserResponse, ResponseEntityPageBaseProcessPathUserResponse } from './model/index';

/**
 * 保存
 * import { postProcessPathUser } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export async function postProcessPathUser(data: ProcessPathUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-path-user`,
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
 * import { deleteProcessPathUser } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export interface deleteProcessPathUserQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessPathUser(params: deleteProcessPathUserQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-path-user`,
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
 * import { getProcessPathUserInfo } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export interface getProcessPathUserInfoQueryInterface {
  id: string; // id
}
export async function getProcessPathUserInfo(params: getProcessPathUserInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessPathUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-path-user/info`,
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
 * import { getProcessPathUserList } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export async function getProcessPathUserList(config = {}): Promise<ResponseEntityListProcessPathUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-path-user/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessPathUserPageList } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export interface getProcessPathUserPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessPathUserPageList(params: getProcessPathUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessPathUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-path-user/page/list`,
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
 * import { putProcessPathUserById } from "/@/apis/gct-apaas/ProcessPathUserController"
 */
export interface putProcessPathUserByIdPathInterface {
  id: string; // id
}
export async function putProcessPathUserById(path: putProcessPathUserByIdPathInterface, data: ProcessPathUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-path-user/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}