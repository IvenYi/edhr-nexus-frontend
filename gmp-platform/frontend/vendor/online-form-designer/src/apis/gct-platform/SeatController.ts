import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListPickerOrgDTO, AppOrgUserPageRequest, ResponseEntityPageBasePickerUserDTO, ResponseEntityListPickerUserDTO, UserDetailRequest, ResponseEntitystring, ResponseEntityPageBaseUserResponse, ResponseEntityListUserResponse, ResponseEntityMapstringint } from './model/index';

/**
 * 获取应用可见组织
 * import { getSeatAppGetVisibleOrg } from "/@/apis/gct-platform/SeatController"
 */
export async function getSeatAppGetVisibleOrg(config = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seat/app/getVisibleOrg`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用可见组织下的人员
 * import { postSeatAppGetVisibleOrgUser } from "/@/apis/gct-platform/SeatController"
 */
export async function postSeatAppGetVisibleOrgUser(data: AppOrgUserPageRequest, config = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/seat/app/getVisibleOrgUser`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用可见用户
 * import { getSeatAppGetVisibleUser } from "/@/apis/gct-platform/SeatController"
 */
export async function getSeatAppGetVisibleUser(config = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seat/app/getVisibleUser`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 用户授权
 * import { postSeatAuth } from "/@/apis/gct-platform/SeatController"
 */
export async function postSeatAuth(data: UserDetailRequest[], config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/seat/auth`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 已授权用户列表
 * import { getSeatListAuthed } from "/@/apis/gct-platform/SeatController"
 */
export interface getSeatListAuthedQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  tenantId?: string; // 租户id
  type?: string; // 类型：平台-platform；套件
  username?: string; // 用户名或账号
}
export async function getSeatListAuthed(params: getSeatListAuthedQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seat/listAuthed`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询未经授权的用户列表
 * import { getSeatListNotAuth } from "/@/apis/gct-platform/SeatController"
 */
export interface getSeatListNotAuthQueryInterface {
  tenantId?: string; // 租户
  type?: string; // 类型：平台-platform；套件
  username?: string; // 用户名或账号
}
export async function getSeatListNotAuth(params: getSeatListNotAuthQueryInterface = {}, config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seat/listNotAuth`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移除已授权用户
 * import { postSeatRemoveAuth } from "/@/apis/gct-platform/SeatController"
 */
export interface postSeatRemoveAuthQueryInterface {
  type?: string; // 类型：平台-platform；套件
}
export async function postSeatRemoveAuth(data: string[], params: postSeatRemoveAuthQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/seat/removeAuth`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 席位总数/剩余可用信息
 * import { getSeatTotalinfos } from "/@/apis/gct-platform/SeatController"
 */
export async function getSeatTotalinfos(config = {}): Promise<ResponseEntityMapstringint['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seat/totalinfos`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}