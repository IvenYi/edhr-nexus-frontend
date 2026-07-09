import { defHttp } from '@/utils/http/axios';
import { UserSaveRequest, ResponseEntitystring, TenantUserRemoveRequest, ResponseEntityOrgUserResponse, ResponseEntityPageBaseUserWithUserExtraDTO, UserIdsDTO } from './model/index';

/**
 * 保存
 * import { postAppUser } from "/@/apis/gct-apaas/AppUserController"
 */
export async function postAppUser(data: UserSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-user`,
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
 * import { deleteAppUser } from "/@/apis/gct-apaas/AppUserController"
 */
export async function deleteAppUser(data: TenantUserRemoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/app-user`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 禁用
 * import { putAppUserDisable } from "/@/apis/gct-apaas/AppUserController"
 */
export interface putAppUserDisableQueryInterface {
  ids: string; // ids
}
export async function putAppUserDisable(params: putAppUserDisableQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/app-user/disable`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 启用
 * import { putAppUserEnable } from "/@/apis/gct-apaas/AppUserController"
 */
export interface putAppUserEnableQueryInterface {
  ids: string; // ids
}
export async function putAppUserEnable(params: putAppUserEnableQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/app-user/enable`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppUserInfoById } from "/@/apis/gct-apaas/AppUserController"
 */
export interface getAppUserInfoByIdPathInterface {
  id: string; // id
}
export async function getAppUserInfoById(path: getAppUserInfoByIdPathInterface, config = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-user/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppUserPageList } from "/@/apis/gct-apaas/AppUserController"
 */
export interface getAppUserPageListQueryInterface {
  enabled?: number; // 是否启用
  endTime?: string; // 创建结束时间
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}
export async function getAppUserPageList(params: getAppUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseUserWithUserExtraDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-user/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移除
 * import { postAppUserRemove } from "/@/apis/gct-apaas/AppUserController"
 */
export async function postAppUserRemove(data: TenantUserRemoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-user/remove`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重置密码
 * import { postAppUserResetDefaultPwd } from "/@/apis/gct-apaas/AppUserController"
 */
export async function postAppUserResetDefaultPwd(data: UserIdsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-user/reset/default/pwd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重置签名密码
 * import { postAppUserResetDefaultSignPwd } from "/@/apis/gct-apaas/AppUserController"
 */
export async function postAppUserResetDefaultSignPwd(data: UserIdsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-user/reset/default/signPwd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppUserById } from "/@/apis/gct-apaas/AppUserController"
 */
export interface putAppUserByIdPathInterface {
  id: string; // id
}
export async function putAppUserById(path: putAppUserByIdPathInterface, data: UserSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/app-user/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}