import { defHttp } from '@/utils/http/axios';
import { OrgRequest, ResponseEntitystring, OrgDragRequest, ResponseEntityOrgResponse, ResponseEntityListOrgResponse, OrgTransferAndDeleteRequest, OrgAddOrUpdateUserRequest, OrgCreateAndAddUserRequest, ResponseEntityOrgUserResponse, OrgMoveUserRequest, ResponseEntityPageBaseOrgUserResponse, OrgRemoveUserRequest } from './model/index';

/**
 * 保存
 * import { postAppOrg } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrg(data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-org`,
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
 * import { deleteAppOrg } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface deleteAppOrgQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppOrg(params: deleteAppOrgQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/app-org`,
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
 * import { postAppOrgDrag } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgDrag(data: OrgDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-org/drag`,
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
 * import { getAppOrgInfoById } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface getAppOrgInfoByIdPathInterface {
  id: string; // id
}
export async function getAppOrgInfoById(path: getAppOrgInfoByIdPathInterface, config = {}): Promise<ResponseEntityOrgResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-org/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppOrgList } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function getAppOrgList(config = {}): Promise<ResponseEntityListOrgResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-org/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 转移并删除
 * import { postAppOrgTransferAndDelete } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgTransferAndDelete(data: OrgTransferAndDeleteRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-org/transferAndDelete`,
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
 * import { postAppOrgUserAdd } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserAdd(data: OrgAddOrUpdateUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-org/user/add`,
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
 * import { postAppOrgUserCreateAndAdd } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserCreateAndAdd(data: OrgCreateAndAddUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-org/user/createAndAdd`,
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
 * import { getAppOrgUserInfo } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface getAppOrgUserInfoQueryInterface {
  orgId: string; // 组织id
  userId: string; // 用户id
}
export async function getAppOrgUserInfo(params: getAppOrgUserInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-org/user/info`,
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
 * import { postAppOrgUserMove } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserMove(data: OrgMoveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-org/user/move`,
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
 * import { getAppOrgUserPageList } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface getAppOrgUserPageListQueryInterface {
  allUserOption?: number; // 是否显示下级
  enabled?: number; // 是否启用
  endTime?: string; // 创建结束时间
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  orgId: string; // 部门id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}
export async function getAppOrgUserPageList(params: getAppOrgUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-org/user/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 移除用户
 * import { postAppOrgUserRemove } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserRemove(data: OrgRemoveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-org/user/remove`,
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
 * import { postAppOrgUserUpdate } from "/@/apis/gct-apaas/AppOrgController"
 */
export async function postAppOrgUserUpdate(data: OrgAddOrUpdateUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-org/user/update`,
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
 * import { putAppOrgById } from "/@/apis/gct-apaas/AppOrgController"
 */
export interface putAppOrgByIdPathInterface {
  id: string; // id
}
export async function putAppOrgById(path: putAppOrgByIdPathInterface, data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/app-org/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}