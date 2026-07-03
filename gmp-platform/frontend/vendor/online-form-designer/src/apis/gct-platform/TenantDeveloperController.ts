import { defHttp } from '@/utils/http/axios';
import { TenantDeveloperRequest, ResponseEntitystring, RemoveAndHandoverRequest, ResponseEntityListAppMemberPO, ResponseEntityTenantDeveloperDTO, ResponseEntityListTenantDeveloperDTO, ResponseEntityPageBaseTenantDeveloperDTO } from './model/index';

/**
 * 保存
 * import { postTenantDeveloper } from "/@/apis/gct-platform/TenantDeveloperController"
 */
export async function postTenantDeveloper(data: TenantDeveloperRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant-developer`,
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
 * import { deleteTenantDeveloper } from "/@/apis/gct-platform/TenantDeveloperController"
 */
export interface deleteTenantDeveloperQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTenantDeveloper(params: deleteTenantDeveloperQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/tenant-developer`,
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
 * 移除并且交接
 * import { postTenantDeveloperREmoveAndHandover } from "/@/apis/gct-platform/TenantDeveloperController"
 */
export async function postTenantDeveloperREmoveAndHandover(data: RemoveAndHandoverRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant-developer/RemoveAndHandover`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询人员是否有维护的应用
 * import { getTenantDeveloperGetUserMaintainerApp } from "/@/apis/gct-platform/TenantDeveloperController"
 */
export interface getTenantDeveloperGetUserMaintainerAppQueryInterface {
  userId: string; // userId
}
export async function getTenantDeveloperGetUserMaintainerApp(params: getTenantDeveloperGetUserMaintainerAppQueryInterface = {}, config = {}): Promise<ResponseEntityListAppMemberPO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant-developer/getUserMaintainerApp`,
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
 * import { getTenantDeveloperInfo } from "/@/apis/gct-platform/TenantDeveloperController"
 */
export interface getTenantDeveloperInfoQueryInterface {
  id: string; // id
}
export async function getTenantDeveloperInfo(params: getTenantDeveloperInfoQueryInterface = {}, config = {}): Promise<ResponseEntityTenantDeveloperDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant-developer/info`,
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
 * import { getTenantDeveloperList } from "/@/apis/gct-platform/TenantDeveloperController"
 */
export async function getTenantDeveloperList(config = {}): Promise<ResponseEntityListTenantDeveloperDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant-developer/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getTenantDeveloperPageList } from "/@/apis/gct-platform/TenantDeveloperController"
 */
export interface getTenantDeveloperPageListQueryInterface {
  account?: string; // 账号
  fullName?: string; // 名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  phone?: string; // 手机号
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  type?: string; // 类型
}
export async function getTenantDeveloperPageList(params: getTenantDeveloperPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseTenantDeveloperDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant-developer/page/list`,
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
 * import { putTenantDeveloperById } from "/@/apis/gct-platform/TenantDeveloperController"
 */
export interface putTenantDeveloperByIdPathInterface {
  id: string; // id
}
export async function putTenantDeveloperById(path: putTenantDeveloperByIdPathInterface, data: TenantDeveloperRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant-developer/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}