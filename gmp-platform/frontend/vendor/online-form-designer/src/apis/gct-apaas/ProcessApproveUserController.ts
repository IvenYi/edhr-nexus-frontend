import { defHttp } from '@/utils/http/axios';
import { ProcessApproveUserRequest, ResponseEntitystring, ResponseEntityProcessApproveUserResponse, ResponseEntityListProcessApproveUserResponse, ResponseEntityPageBaseProcessApproveUserResponse } from './model/index';

/**
 * 保存
 * import { postProcessApproveUser } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export async function postProcessApproveUser(data: ProcessApproveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-approve-user`,
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
 * import { deleteProcessApproveUser } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export interface deleteProcessApproveUserQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessApproveUser(params: deleteProcessApproveUserQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-approve-user`,
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
 * import { getProcessApproveUserInfo } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export interface getProcessApproveUserInfoQueryInterface {
  id: string; // id
}
export async function getProcessApproveUserInfo(params: getProcessApproveUserInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessApproveUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-approve-user/info`,
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
 * import { getProcessApproveUserList } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export async function getProcessApproveUserList(config = {}): Promise<ResponseEntityListProcessApproveUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-approve-user/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessApproveUserPageList } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export interface getProcessApproveUserPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessApproveUserPageList(params: getProcessApproveUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessApproveUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-approve-user/page/list`,
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
 * import { putProcessApproveUserById } from "/@/apis/gct-apaas/ProcessApproveUserController"
 */
export interface putProcessApproveUserByIdPathInterface {
  id: string; // id
}
export async function putProcessApproveUserById(path: putProcessApproveUserByIdPathInterface, data: ProcessApproveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-approve-user/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}