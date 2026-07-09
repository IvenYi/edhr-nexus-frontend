import { defHttp } from '@/utils/http/axios';
import { AppBranchRequest, ResponseEntitystring, ResponseEntityAppBranchResponse, ResponseEntityListAppBranchResponse, ResponseEntityPageBaseAppBranchResponse } from './model/index';

/**
 * 保存
 * import { postAppBranch } from "/@/apis/gct-apaas/AppBranchController"
 */
export async function postAppBranch(data: AppBranchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-branch`,
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
 * import { deleteAppBranch } from "/@/apis/gct-apaas/AppBranchController"
 */
export interface deleteAppBranchQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppBranch(params: deleteAppBranchQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/app-branch`,
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
 * import { getAppBranchInfo } from "/@/apis/gct-apaas/AppBranchController"
 */
export interface getAppBranchInfoQueryInterface {
  id: string; // id
}
export async function getAppBranchInfo(params: getAppBranchInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAppBranchResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-branch/info`,
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
 * import { getAppBranchList } from "/@/apis/gct-apaas/AppBranchController"
 */
export async function getAppBranchList(config = {}): Promise<ResponseEntityListAppBranchResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-branch/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppBranchPageList } from "/@/apis/gct-apaas/AppBranchController"
 */
export interface getAppBranchPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAppBranchPageList(params: getAppBranchPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppBranchResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-branch/page/list`,
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
 * import { putAppBranchById } from "/@/apis/gct-apaas/AppBranchController"
 */
export interface putAppBranchByIdPathInterface {
  id: string; // id
}
export async function putAppBranchById(path: putAppBranchByIdPathInterface, data: AppBranchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/app-branch/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}