import { defHttp } from '@/utils/http/axios';
import { PluginVersionRequest, ResponseEntitystring, ResponseEntityPluginVersionResponse, ResponseEntityListPluginVersionResponse, ResponseEntityPageBasePluginVersionResponse } from './model/index';

/**
 * 保存
 * import { postPluginVersion } from "/@/apis/gct-platform/PluginVersionController"
 */
export async function postPluginVersion(data: PluginVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plugin-version`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除版本
 * import { deletePluginVersion } from "/@/apis/gct-platform/PluginVersionController"
 */
export interface deletePluginVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePluginVersion(params: deletePluginVersionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/plugin-version`,
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
 * import { getPluginVersionInfo } from "/@/apis/gct-platform/PluginVersionController"
 */
export interface getPluginVersionInfoQueryInterface {
  id: string; // id
}
export async function getPluginVersionInfo(params: getPluginVersionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPluginVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plugin-version/info`,
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
 * import { postPluginVersionList } from "/@/apis/gct-platform/PluginVersionController"
 */
export async function postPluginVersionList(data: PluginVersionRequest, config = {}): Promise<ResponseEntityListPluginVersionResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plugin-version/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPluginVersionPageList } from "/@/apis/gct-platform/PluginVersionController"
 */
export interface getPluginVersionPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPluginVersionPageList(params: getPluginVersionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePluginVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plugin-version/page/list`,
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
 * import { putPluginVersionById } from "/@/apis/gct-platform/PluginVersionController"
 */
export interface putPluginVersionByIdPathInterface {
  id: string; // id
}
export async function putPluginVersionById(path: putPluginVersionByIdPathInterface, data: PluginVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/plugin-version/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}