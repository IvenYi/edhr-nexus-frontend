import request from '@mobile/utils/request';
import type { MenuConfigRequest, ResponseEntitystring, ResponseEntityListMenuConfigResponse, ResponseEntityMenuConfigResponse, MenuConfigMoveRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 菜单保存
 * import { postMenuConfig } from "/@/apis/gct-apaas/MenuConfigController"
 */
export async function postMenuConfig(data: MenuConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/menu-config`,
      method: 'post',
      data,
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
export async function deleteMenuConfig(params: deleteMenuConfigQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/menu-config`,
      method: 'delete',
      params,
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
export async function getMenuConfigAvailableList(params: getMenuConfigAvailableListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMenuConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/menu-config/available/list`,
      method: 'get',
      params,
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
export async function getMenuConfigInfo(params: getMenuConfigInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMenuConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/menu-config/info`,
      method: 'get',
      params,
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
export async function getMenuConfigList(params: getMenuConfigListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMenuConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/menu-config/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 移动菜单
 * import { postMenuConfigMove } from "/@/apis/gct-apaas/MenuConfigController"
 */
export async function postMenuConfigMove(data: MenuConfigMoveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/menu-config/move`,
      method: 'post',
      data,
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
export async function putMenuConfigById(path: putMenuConfigByIdPathInterface, data: MenuConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/menu-config/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}