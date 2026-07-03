import { defHttp } from '@/utils/http/axios';
import { UserSaveRequest, ResponseEntitystring, TenantUserRemoveRequest, ResponseEntityOrgUserResponse, ResponseEntityPageBaseUserWithUserExtraDTO, UserIdsDTO } from './model/index';

/**
 * 保存
 * import { postTenantManagementUser } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function postTenantManagementUser(data: UserSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/user`,
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
 * import { deleteTenantManagementUser } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function deleteTenantManagementUser(data: TenantUserRemoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/tenant/management/user`,
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
 * import { putTenantManagementUserDisable } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface putTenantManagementUserDisableQueryInterface {
  ids: string; // ids
}
export async function putTenantManagementUserDisable(params: putTenantManagementUserDisableQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant/management/user/disable`,
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
 * import { putTenantManagementUserEnable } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface putTenantManagementUserEnableQueryInterface {
  ids: string; // ids
}
export async function putTenantManagementUserEnable(params: putTenantManagementUserEnableQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant/management/user/enable`,
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
 * import { getTenantManagementUserInfoById } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface getTenantManagementUserInfoByIdPathInterface {
  id: string; // id
}
export async function getTenantManagementUserInfoById(path: getTenantManagementUserInfoByIdPathInterface, config = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/management/user/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTenantManagementUserPageList } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface getTenantManagementUserPageListQueryInterface {
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
export async function getTenantManagementUserPageList(params: getTenantManagementUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseUserWithUserExtraDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/management/user/page/list`,
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
 * import { postTenantManagementUserRemove } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function postTenantManagementUserRemove(data: TenantUserRemoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/user/remove`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重置登录密码
 * import { postTenantManagementUserResetDefaultPwd } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function postTenantManagementUserResetDefaultPwd(data: UserIdsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/user/reset/default/pwd`,
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
 * import { postTenantManagementUserResetDefaultSignPwd } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export async function postTenantManagementUserResetDefaultSignPwd(data: UserIdsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/user/reset/default/signPwd`,
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
 * import { putTenantManagementUserById } from "/@/apis/gct-platform/TenantManagementUserController"
 */
export interface putTenantManagementUserByIdPathInterface {
  id: string; // id
}
export async function putTenantManagementUserById(path: putTenantManagementUserByIdPathInterface, data: UserSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant/management/user/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}