import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, UserSaveRequest, ResponseEntityUserLoginResp, ResponseEntityUserResponse, ResponseEntityListUserResponse, ResponseEntityPasswordInfo, ResponseEntityobject, ExcelOrgUserSearchReq, ResponseEntityPageBaseUserResponse, ExcelUserSearchReq, UserCodeDTO, UserIdsDTO, UserSettingsDTO } from './model/index';

/**
 * 文件上传minio
 * import { postFileUploadImage } from "/@/apis/gct-platform/UserController"
 */
export interface postFileUploadImageQueryInterface {
  bucket: string; // 桶枚举值,(IMAGE 图片桶,ICON 图标桶)
}
export async function postFileUploadImage(data: any, params: postFileUploadImageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/file/upload/image`,
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
 * 新增用户
 * import { postUser } from "/@/apis/gct-platform/UserController"
 */
export async function postUser(data: UserSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user`,
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
 * import { deleteUser } from "/@/apis/gct-platform/UserController"
 */
export interface deleteUserQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteUser(params: deleteUserQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/user`,
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
 * 获取用户信息
 * import { getUserInfo } from "/@/apis/gct-platform/UserController"
 */
export async function getUserInfo(config = {}): Promise<ResponseEntityUserLoginResp['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user/info`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getUserInfoById } from "/@/apis/gct-platform/UserController"
 */
export interface getUserInfoByIdPathInterface {
  id: string; // id
}
export async function getUserInfoById(path: getUserInfoByIdPathInterface, config = {}): Promise<ResponseEntityUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 多用户详情
 * import { getUserInfoByIds } from "/@/apis/gct-platform/UserController"
 */
export interface getUserInfoByIdsQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function getUserInfoByIds(params: getUserInfoByIdsQueryInterface = {}, config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user/infoByIds`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询用户上次修改密码信息
 * import { getUserLastResetPwd } from "/@/apis/gct-platform/UserController"
 */
export async function getUserLastResetPwd(config = {}): Promise<ResponseEntityPasswordInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user/last/reset/pwd`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getUserList } from "/@/apis/gct-platform/UserController"
 */
export interface getUserListQueryInterface {
  keyword?: string; // keyword
}
export async function getUserList(params: getUserListQueryInterface = {}, config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 当前租户下的用户列表
 * import { getUserListByTenantId } from "/@/apis/gct-platform/UserController"
 */
export interface getUserListByTenantIdQueryInterface {
  fullname?: string; // 姓名
  username?: string; // 账号
}
export async function getUserListByTenantId(params: getUserListByTenantIdQueryInterface = {}, config = {}): Promise<ResponseEntityListUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user/listByTenantId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (平台管理)组织成员 导入人员
 * import { postUserOrgPlatImport } from "/@/apis/gct-platform/UserController"
 */
export interface postUserOrgPlatImportQueryInterface {
  orgId: string; // 导入的部门Id
}
export async function postUserOrgPlatImport(data: any, params: postUserOrgPlatImportQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/org/plat/import`,
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
 * (平台管理)组织成员 导出部门人员
 * import { postUserOrgPlatTmpl } from "/@/apis/gct-platform/UserController"
 */
export async function postUserOrgPlatTmpl(data: ExcelOrgUserSearchReq, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/org/plat/tmpl`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)组织成员 导入人员
 * import { postUserOrgTenantImport } from "/@/apis/gct-platform/UserController"
 */
export interface postUserOrgTenantImportQueryInterface {
  orgId: string; // 导入的部门Id
}
export async function postUserOrgTenantImport(data: any, params: postUserOrgTenantImportQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/org/tenant/import`,
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
 * (租户管理后台)组织成员 导入人员
 * import { postUserOrgTenantImport4App } from "/@/apis/gct-platform/UserController"
 */
export interface postUserOrgTenantImport4AppQueryInterface {
  orgId: string; // 导入的部门Id
}
export async function postUserOrgTenantImport4App(data: any, params: postUserOrgTenantImport4AppQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/org/tenant/import4App`,
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
 * (租户管理后台)组织成员 导出部门人员
 * import { postUserOrgTenantTmpl } from "/@/apis/gct-platform/UserController"
 */
export async function postUserOrgTenantTmpl(data: ExcelOrgUserSearchReq, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/org/tenant/tmpl`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)组织成员 导出部门人员
 * import { postUserOrgTenantTmpl4App } from "/@/apis/gct-platform/UserController"
 */
export async function postUserOrgTenantTmpl4App(data: ExcelOrgUserSearchReq, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/org/tenant/tmpl4App`,
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
 * import { getUserPageList } from "/@/apis/gct-platform/UserController"
 */
export interface getUserPageListQueryInterface {
  endTime?: string; // 创建结束时间
  fullname?: string; // 姓名
  mobile?: string; // 手机号码
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 创建开始时间
  username?: string; // 账号
}
export async function getUserPageList(params: getUserPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseUserResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/user/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (平台管理)用户管理 导入(平台/公司)人员
 * import { postUserPlatImport } from "/@/apis/gct-platform/UserController"
 */
export async function postUserPlatImport(data: any, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/plat/import`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (平台管理)用户管理 导出人员
 * import { postUserPlatTmpl } from "/@/apis/gct-platform/UserController"
 */
export async function postUserPlatTmpl(data: ExcelUserSearchReq, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/plat/tmpl`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改密码与签名密码
 * import { postUserResetAllpwd } from "/@/apis/gct-platform/UserController"
 */
export async function postUserResetAllpwd(data: UserCodeDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/reset/allpwd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重置登录密码
 * import { postUserResetDefaultPwd } from "/@/apis/gct-platform/UserController"
 */
export async function postUserResetDefaultPwd(data: UserIdsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/reset/default/pwd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 重置签名密码
 * import { postUserResetDefaultSignPwd } from "/@/apis/gct-platform/UserController"
 */
export async function postUserResetDefaultSignPwd(data: UserIdsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/reset/default/signPwd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改密码
 * import { postUserResetPwd } from "/@/apis/gct-platform/UserController"
 */
export async function postUserResetPwd(data: UserCodeDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/reset/pwd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 用户设置
 * import { postUserSettings } from "/@/apis/gct-platform/UserController"
 */
export async function postUserSettings(data: UserSettingsDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/settings`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)用户管理 导入(平台/公司)人员
 * import { postUserTenantImport } from "/@/apis/gct-platform/UserController"
 */
export async function postUserTenantImport(data: any, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/tenant/import`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)用户管理 导入(平台/公司)人员
 * import { postUserTenantImport4App } from "/@/apis/gct-platform/UserController"
 */
export async function postUserTenantImport4App(data: any, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/tenant/import4App`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)用户管理 导出人员
 * import { postUserTenantTmpl } from "/@/apis/gct-platform/UserController"
 */
export async function postUserTenantTmpl(data: ExcelUserSearchReq, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/tenant/tmpl`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * (租户管理后台)用户管理 导出人员
 * import { postUserTenantTmpl4App } from "/@/apis/gct-platform/UserController"
 */
export async function postUserTenantTmpl4App(data: ExcelUserSearchReq, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/api/user/tenant/tmpl4App`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 编辑用户信息
 * import { putUserById } from "/@/apis/gct-platform/UserController"
 */
export interface putUserByIdPathInterface {
  id: string; // id
}
export async function putUserById(path: putUserByIdPathInterface, data: UserSaveRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/user/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}