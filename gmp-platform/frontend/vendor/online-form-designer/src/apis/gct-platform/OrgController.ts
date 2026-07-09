import { defHttp } from '@/utils/http/axios';
import { OrgRequest, ResponseEntitystring, OrgDragRequest, ResponseEntityOrgResponse, ResponseEntityListOrgResponse, ResponseEntityboolean, OrgTransferAndDeleteRequest, OrgAddOrUpdateUserRequest, OrgCreateAndAddUserRequest, ResponseEntityOrgUserResponse, ResponseEntityListOrgUserResponse, OrgMoveUserRequest, ResponseEntityPageBaseOrgUserResponse, OrgRemoveUserRequest } from './model/index';

/**
 * 组织保存
 * import { postOrg } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrg(data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org`,
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
 * import { deleteOrg } from "/@/apis/gct-platform/OrgController"
 */
export interface deleteOrgQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOrg(params: deleteOrgQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/org`,
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
 * import { postOrgDrag } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgDrag(data: OrgDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/drag`,
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
 * import { getOrgInfoById } from "/@/apis/gct-platform/OrgController"
 */
export interface getOrgInfoByIdPathInterface {
  id: string; // id
}
export async function getOrgInfoById(path: getOrgInfoByIdPathInterface, config = {}): Promise<ResponseEntityOrgResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 名称、编号输入校验
 * import { postOrgInputCheck } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgInputCheck(data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/inputCheck`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getOrgList } from "/@/apis/gct-platform/OrgController"
 */
export async function getOrgList(config = {}): Promise<ResponseEntityListOrgResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 组织删除校验
 * import { postOrgOrgHavePersonCheck } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgOrgHavePersonCheck(data: OrgRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/orgHavePersonCheck`,
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
 * import { postOrgTransferAndDelete } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgTransferAndDelete(data: OrgTransferAndDeleteRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/transferAndDelete`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 组织成员添加用户
 * import { postOrgUserAdd } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgUserAdd(data: OrgAddOrUpdateUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/user/add`,
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
 * import { postOrgUserCreateAndAdd } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgUserCreateAndAdd(data: OrgCreateAndAddUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/user/createAndAdd`,
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
 * import { getOrgUserInfo } from "/@/apis/gct-platform/OrgController"
 */
export interface getOrgUserInfoQueryInterface {
  orgId: string; // 组织id
  userId: string; // 用户id
}
export async function getOrgUserInfo(params: getOrgUserInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org/user/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询当前租户下的用户
 * import { getOrgUserListCurrentTenantUser } from "/@/apis/gct-platform/OrgController"
 */
export interface getOrgUserListCurrentTenantUserQueryInterface {
  keyword?: string; // 关键字
  orgId: string; // 部门id
}
export async function getOrgUserListCurrentTenantUser(params: getOrgUserListCurrentTenantUserQueryInterface = {}, config = {}): Promise<ResponseEntityListOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org/user/listCurrentTenantUser`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 组织成员移动用户
 * import { postOrgUserMove } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgUserMove(data: OrgMoveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/user/move`,
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
 * import { getOrgUserPageList } from "/@/apis/gct-platform/OrgController"
 */
export interface getOrgUserPageListQueryInterface {
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
  source?: number; // 参数来源，0企业后台管理、1租户后台管理
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}
export async function getOrgUserPageList(params: getOrgUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/org/user/page/list`,
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
 * import { postOrgUserRemove } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgUserRemove(data: OrgRemoveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/user/remove`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 组织成员编辑用户
 * import { postOrgUserUpdate } from "/@/apis/gct-platform/OrgController"
 */
export async function postOrgUserUpdate(data: OrgAddOrUpdateUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/org/user/update`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 组织成员修改
 * import { putOrgById } from "/@/apis/gct-platform/OrgController"
 */
export interface putOrgByIdPathInterface {
  id: string; // id
}
export async function putOrgById(path: putOrgByIdPathInterface, data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/org/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}