import { defHttp } from '@/utils/http/axios';
import { OrgRequest, ResponseEntitystring, OrgDragRequest, ResponseEntityOrgResponse, ResponseEntityListOrgResponse, OrgTransferAndDeleteRequest, OrgAddOrUpdateUserRequest, OrgCreateAndAddUserRequest, ResponseEntityOrgUserResponse, OrgMoveUserRequest, OrgUserSearchRequest, ResponseEntityPageBaseOrgUserResponse, OrgRemoveUserRequest } from './model/index';

/**
 * 保存
 * import { postAppOrgExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgExternal(data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org`,
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
 * import { deleteAppOrgExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export interface deleteAppOrgExternalQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppOrgExternal(params: deleteAppOrgExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/external/api/app/org`,
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
 * 拖拽
 * import { postAppOrgDragExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgDragExternal(data: OrgDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/drag`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppOrgInfoByIdExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export interface getAppOrgInfoByIdExternalPathInterface {
  id: string; // id
}
export async function getAppOrgInfoByIdExternal(path: getAppOrgInfoByIdExternalPathInterface, config = {}): Promise<ResponseEntityOrgResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app/org/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppOrgListExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function getAppOrgListExternal(config = {}): Promise<ResponseEntityListOrgResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app/org/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存多组织
 * import { postAppOrgSaveListExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgSaveListExternal(data: OrgRequest[], config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/save-list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 转移并删除
 * import { postAppOrgTransferAndDeleteExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgTransferAndDeleteExternal(data: OrgTransferAndDeleteRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/transferAndDelete`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 添加用户
 * import { postAppOrgUserAddExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgUserAddExternal(data: OrgAddOrUpdateUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/user/add`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 创建并添加用户
 * import { postAppOrgUserCreateAndAddExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export interface postAppOrgUserCreateAndAddExternalQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function postAppOrgUserCreateAndAddExternal(data: OrgCreateAndAddUserRequest, params: postAppOrgUserCreateAndAddExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/user/createAndAdd`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询用户详情
 * import { getAppOrgUserInfoExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export interface getAppOrgUserInfoExternalQueryInterface {
  orgId: string; // 组织id
  userId: string; // 用户id
}
export async function getAppOrgUserInfoExternal(params: getAppOrgUserInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app/org/user/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移动用户
 * import { postAppOrgUserMoveExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgUserMoveExternal(data: OrgMoveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/user/move`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 组织用户分页查询
 * import { postAppOrgUserPageListExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgUserPageListExternal(data: OrgUserSearchRequest, config = {}): Promise<ResponseEntityPageBaseOrgUserResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/user/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移除用户
 * import { postAppOrgUserRemoveExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgUserRemoveExternal(data: OrgRemoveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/user/remove`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 编辑用户
 * import { postAppOrgUserUpdateExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export async function postAppOrgUserUpdateExternal(data: OrgAddOrUpdateUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/org/user/update`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppOrgByIdExternal } from "/@/apis/gct-platform/ExternalAppOrgController"
 */
export interface putAppOrgByIdExternalPathInterface {
  id: string; // id
}
export async function putAppOrgByIdExternal(path: putAppOrgByIdExternalPathInterface, data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/external/api/app/org/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}