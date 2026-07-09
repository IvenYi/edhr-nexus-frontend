import { defHttp } from '@/utils/http/axios';
import { OrgRequest, ResponseEntitystring, OrgDragRequest, ResponseEntityOrgResponse, ResponseEntityListOrgResponse, OrgTransferAndDeleteRequest, OrgAddOrUpdateUserRequest, OrgCreateAndAddUserRequest, ResponseEntityOrgUserResponse, OrgMoveUserRequest, ResponseEntityPageBaseOrgUserResponse, OrgRemoveUserRequest } from './model/index';

/**
 * 保存
 * import { postTenantManagementOrg } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrg(data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/org`,
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
 * import { deleteTenantManagementOrg } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface deleteTenantManagementOrgQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTenantManagementOrg(params: deleteTenantManagementOrgQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/tenant/management/org`,
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
 * import { postTenantManagementOrgDrag } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgDrag(data: OrgDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/org/drag`,
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
 * import { getTenantManagementOrgInfoById } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface getTenantManagementOrgInfoByIdPathInterface {
  id: string; // id
}
export async function getTenantManagementOrgInfoById(path: getTenantManagementOrgInfoByIdPathInterface, config = {}): Promise<ResponseEntityOrgResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/management/org/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getTenantManagementOrgList } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function getTenantManagementOrgList(config = {}): Promise<ResponseEntityListOrgResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/management/org/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 转移并删除
 * import { postTenantManagementOrgTransferAndDelete } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgTransferAndDelete(data: OrgTransferAndDeleteRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/org/transferAndDelete`,
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
 * import { postTenantManagementOrgUserAdd } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserAdd(data: OrgAddOrUpdateUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/org/user/add`,
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
 * import { postTenantManagementOrgUserCreateAndAdd } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserCreateAndAdd(data: OrgCreateAndAddUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/org/user/createAndAdd`,
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
 * import { getTenantManagementOrgUserInfo } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface getTenantManagementOrgUserInfoQueryInterface {
  orgId: string; // 组织id
  userId: string; // 用户id
}
export async function getTenantManagementOrgUserInfo(params: getTenantManagementOrgUserInfoQueryInterface = {}, config = {}): Promise<ResponseEntityOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/management/org/user/info`,
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
 * import { postTenantManagementOrgUserMove } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserMove(data: OrgMoveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/org/user/move`,
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
 * import { getTenantManagementOrgUserPageList } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface getTenantManagementOrgUserPageListQueryInterface {
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
export async function getTenantManagementOrgUserPageList(params: getTenantManagementOrgUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseOrgUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/tenant/management/org/user/page/list`,
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
 * import { postTenantManagementOrgUserRemove } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserRemove(data: OrgRemoveUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/org/user/remove`,
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
 * import { postTenantManagementOrgUserUpdate } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export async function postTenantManagementOrgUserUpdate(data: OrgAddOrUpdateUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/tenant/management/org/user/update`,
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
 * import { putTenantManagementOrgById } from "/@/apis/gct-platform/TenantManagementOrgController"
 */
export interface putTenantManagementOrgByIdPathInterface {
  id: string; // id
}
export async function putTenantManagementOrgById(path: putTenantManagementOrgByIdPathInterface, data: OrgRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/tenant/management/org/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}