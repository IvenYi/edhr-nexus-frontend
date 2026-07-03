import { defHttp } from '@/utils/http/axios';
import { SysConfigRequest, ResponseEntitystring, ResponseEntitySysConfigResponse, ResponseEntityListSysConfigResponse, ResponseEntityPageBaseSysConfigResponse } from './model/index';

/**
 * 保存
 * import { postSysConfig } from "/@/apis/gct-apaas/SysConfigController"
 */
export async function postSysConfig(data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/sys-config`,
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
 * import { deleteSysConfig } from "/@/apis/gct-apaas/SysConfigController"
 */
export interface deleteSysConfigQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSysConfig(params: deleteSysConfigQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/sys-config`,
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
 * import { getSysConfigInfo } from "/@/apis/gct-apaas/SysConfigController"
 */
export interface getSysConfigInfoQueryInterface {
  key: string; // key
}
export async function getSysConfigInfo(params: getSysConfigInfoQueryInterface = {}, config = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sys-config/info`,
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
 * import { getSysConfigList } from "/@/apis/gct-apaas/SysConfigController"
 */
export async function getSysConfigList(config = {}): Promise<ResponseEntityListSysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sys-config/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getSysConfigPageList } from "/@/apis/gct-apaas/SysConfigController"
 */
export interface getSysConfigPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getSysConfigPageList(params: getSysConfigPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseSysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/sys-config/page/list`,
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
 * import { putSysConfigById } from "/@/apis/gct-apaas/SysConfigController"
 */
export interface putSysConfigByIdPathInterface {
  id: string; // id
}
export async function putSysConfigById(path: putSysConfigByIdPathInterface, data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/sys-config/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}