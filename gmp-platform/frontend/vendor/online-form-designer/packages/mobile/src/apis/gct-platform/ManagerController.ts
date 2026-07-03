import request from '@mobile/utils/request';
import type { ResponseEntityPageBaseManagerBean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * (平台管理)管理员分页列表
 * import { getManagerPlatPageList } from "/@/apis/gct-platform/ManagerController"
 */
export interface getManagerPlatPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getManagerPlatPageList(params: getManagerPlatPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseManagerBean['data']> {
  return request(
    {
      url: `/gct-platform/api/manager/plat/page/list`,
      method: 'get',
      params,
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
export async function getManagerTenantPageList(params: getManagerTenantPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseManagerBean['data']> {
  return request(
    {
      url: `/gct-platform/api/manager/tenant/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}