import { defHttp } from '@/utils/http/axios';
import { ResponseEntityPageBaseManagerBean } from './model/index';

/**
 * (平台管理)管理员分页列表
 * import { getManagerPlatPageList } from "/@/apis/gct-platform/ManagerController"
 */
export interface getManagerPlatPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getManagerPlatPageList(params: getManagerPlatPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseManagerBean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/manager/plat/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)管理员分页列表
 * import { getManagerTenantPageList } from "/@/apis/gct-platform/ManagerController"
 */
export interface getManagerTenantPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getManagerTenantPageList(params: getManagerTenantPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseManagerBean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/manager/tenant/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}