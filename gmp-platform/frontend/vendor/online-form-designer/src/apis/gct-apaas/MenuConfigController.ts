import { defHttp } from '@/utils/http/axios';
import { MenuConfigRequest, ResponseEntitystring, ResponseEntityListMenuConfigResponse, ResponseEntityMenuConfigResponse, MenuConfigMoveRequest } from './model/index';

/**
 * 菜单保存
 * import { postMenuConfig } from "/@/apis/gct-apaas/MenuConfigController"
 */
export async function postMenuConfig(data: MenuConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/menu-config`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除菜单
 * import { deleteMenuConfig } from "/@/apis/gct-apaas/MenuConfigController"
 */
export interface deleteMenuConfigQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMenuConfig(params: deleteMenuConfigQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/menu-config`,
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
 * 查询可查看菜单列表
 * import { getMenuConfigAvailableList } from "/@/apis/gct-apaas/MenuConfigController"
 */
export interface getMenuConfigAvailableListQueryInterface {
  menuType?: string; // 菜单类型
}
export async function getMenuConfigAvailableList(params: getMenuConfigAvailableListQueryInterface = {}, config = {}): Promise<ResponseEntityListMenuConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/menu-config/available/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 菜单详情
 * import { getMenuConfigInfo } from "/@/apis/gct-apaas/MenuConfigController"
 */
export interface getMenuConfigInfoQueryInterface {
  id: string; // id
}
export async function getMenuConfigInfo(params: getMenuConfigInfoQueryInterface = {}, config = {}): Promise<ResponseEntityMenuConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/menu-config/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 菜单配置列表
 * import { getMenuConfigList } from "/@/apis/gct-apaas/MenuConfigController"
 */
export interface getMenuConfigListQueryInterface {
  menuType?: string; // 菜单类型
}
export async function getMenuConfigList(params: getMenuConfigListQueryInterface = {}, config = {}): Promise<ResponseEntityListMenuConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/menu-config/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移动菜单
 * import { postMenuConfigMove } from "/@/apis/gct-apaas/MenuConfigController"
 */
export async function postMenuConfigMove(data: MenuConfigMoveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/menu-config/move`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 菜单修改
 * import { putMenuConfigById } from "/@/apis/gct-apaas/MenuConfigController"
 */
export interface putMenuConfigByIdPathInterface {
  id: string; // id
}
export async function putMenuConfigById(path: putMenuConfigByIdPathInterface, data: MenuConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/menu-config/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}