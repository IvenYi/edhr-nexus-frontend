import request from '@mobile/utils/request';
import type { RolePermissionRequest, ResponseEntitystring, RolePermissionListDTO, ResponseEntityMenuPermissionDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 角色权限保存
 * import { postRolePermission } from "/@/apis/gct-apaas/RolePermissionController"
 */
export async function postRolePermission(data: RolePermissionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/role-permission`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 角色权限批量保存
 * import { postRolePermissionBulk } from "/@/apis/gct-apaas/RolePermissionController"
 */
export async function postRolePermissionBulk(data: RolePermissionListDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/role-permission/bulk`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 权限配置权限列表查询
 * import { getRolePermissionMenuList } from "/@/apis/gct-apaas/RolePermissionController"
 */
export interface getRolePermissionMenuListQueryInterface {
  roleId: string; // 角色id
  type: string; // 权限分类 (WEB/MOBILE)
}
export async function getRolePermissionMenuList(params: getRolePermissionMenuListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMenuPermissionDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/role-permission/menu/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 角色权限删除
 * import { postRolePermissionRemove } from "/@/apis/gct-apaas/RolePermissionController"
 */
export async function postRolePermissionRemove(data: RolePermissionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/role-permission/remove`,
      method: 'post',
      data,
      ...config,
    },
  );
}