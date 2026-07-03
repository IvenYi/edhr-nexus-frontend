import { defHttp } from '@/utils/http/axios';
import { RolePermissionRequest, ResponseEntitystring, RolePermissionListDTO, ResponseEntityMenuPermissionDTO } from './model/index';

/**
 * 角色权限保存
 * import { postRolePermission } from "/@/apis/gct-apaas/RolePermissionController"
 */
export async function postRolePermission(data: RolePermissionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/role-permission`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 角色权限批量保存
 * import { postRolePermissionBulk } from "/@/apis/gct-apaas/RolePermissionController"
 */
export async function postRolePermissionBulk(data: RolePermissionListDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/role-permission/bulk`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getRolePermissionMenuList(params: getRolePermissionMenuListQueryInterface = {}, config = {}): Promise<ResponseEntityMenuPermissionDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/role-permission/menu/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 角色权限删除
 * import { postRolePermissionRemove } from "/@/apis/gct-apaas/RolePermissionController"
 */
export async function postRolePermissionRemove(data: RolePermissionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/role-permission/remove`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}