import { defHttp } from '@/utils/http/axios';
import { UserExtraRequest, ResponseEntitystring, ResponseEntityUserExtraResponse, ResponseEntityListUserExtraResponse, ResponseEntityPageBaseUserExtraResponse } from './model/index';

/**
 * 保存
 * import { postUserExtra } from "/@/apis/gct-platform/UserExtraController"
 */
export async function postUserExtra(data: UserExtraRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user-extra`,
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
 * import { deleteUserExtra } from "/@/apis/gct-platform/UserExtraController"
 */
export interface deleteUserExtraQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteUserExtra(params: deleteUserExtraQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/user-extra`,
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
 * import { getUserExtraInfo } from "/@/apis/gct-platform/UserExtraController"
 */
export interface getUserExtraInfoQueryInterface {
  id: string; // id
}
export async function getUserExtraInfo(params: getUserExtraInfoQueryInterface = {}, config = {}): Promise<ResponseEntityUserExtraResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user-extra/info`,
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
 * import { getUserExtraList } from "/@/apis/gct-platform/UserExtraController"
 */
export async function getUserExtraList(config = {}): Promise<ResponseEntityListUserExtraResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user-extra/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getUserExtraPageList } from "/@/apis/gct-platform/UserExtraController"
 */
export interface getUserExtraPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getUserExtraPageList(params: getUserExtraPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseUserExtraResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user-extra/page/list`,
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
 * import { putUserExtraById } from "/@/apis/gct-platform/UserExtraController"
 */
export interface putUserExtraByIdPathInterface {
  id: string; // id
}
export async function putUserExtraById(path: putUserExtraByIdPathInterface, data: UserExtraRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/user-extra/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}