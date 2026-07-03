import request from '@mobile/utils/request';
import type { ResponseEntitystring, UserSaveRequest, ResponseEntityUserLoginResp, ResponseEntityUserResponse, ResponseEntityListUserResponse, ResponseEntityPasswordInfo, ResponseEntityobject, ExcelOrgUserSearchReq, ResponseEntityPageBaseUserResponse, ExcelUserSearchReq, UserCodeDTO, UserIdsDTO, UserSettingsDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 文件上传minio
 * import { postFileUploadImage } from "/@/apis/gct-platform/UserController"
 */
export interface postFileUploadImageQueryInterface {
  bucket: string; // 桶枚举值,(IMAGE 图片桶,ICON 图标桶)
}
export async function postFileUploadImage(data: undefined, params: postFileUploadImageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/file/upload/image`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 新增用户
 * import { postUser } from "/@/apis/gct-platform/UserController"
 */
export async function postUser(data: UserSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user`,
      method: 'post',
      data,
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
export async function deleteUser(params: deleteUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 获取用户信息
 * import { getUserInfo } from "/@/apis/gct-platform/UserController"
 */
export async function getUserInfo(config:AxiosRequestConfig = {}): Promise<ResponseEntityUserLoginResp['data']> {
  return request(
    {
      url: `/gct-platform/api/user/info`,
      method: 'get',
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
export async function getUserInfoById(path: getUserInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user/info/${path?.id}`,
      method: 'get',
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
export async function getUserInfoByIds(params: getUserInfoByIdsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user/infoByIds`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询用户上次修改密码信息
 * import { getUserLastResetPwd } from "/@/apis/gct-platform/UserController"
 */
export async function getUserLastResetPwd(config:AxiosRequestConfig = {}): Promise<ResponseEntityPasswordInfo['data']> {
  return request(
    {
      url: `/gct-platform/api/user/last/reset/pwd`,
      method: 'get',
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
export async function getUserList(params: getUserListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user/list`,
      method: 'get',
      params,
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
export async function getUserListByTenantId(params: getUserListByTenantIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user/listByTenantId`,
      method: 'get',
      params,
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
export async function postUserOrgPlatImport(data: undefined, params: postUserOrgPlatImportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/user/org/plat/import`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * (平台管理)组织成员 导出部门人员
 * import { postUserOrgPlatTmpl } from "/@/apis/gct-platform/UserController"
 */
export async function postUserOrgPlatTmpl(data: ExcelOrgUserSearchReq, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/user/org/plat/tmpl`,
      method: 'post',
      data,
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
export async function postUserOrgTenantImport(data: undefined, params: postUserOrgTenantImportQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/user/org/tenant/import`,
      method: 'post',
      params,
      data,
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
export async function postUserOrgTenantImport4App(data: undefined, params: postUserOrgTenantImport4AppQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/user/org/tenant/import4App`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)组织成员 导出部门人员
 * import { postUserOrgTenantTmpl } from "/@/apis/gct-platform/UserController"
 */
export async function postUserOrgTenantTmpl(data: ExcelOrgUserSearchReq, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/user/org/tenant/tmpl`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)组织成员 导出部门人员
 * import { postUserOrgTenantTmpl4App } from "/@/apis/gct-platform/UserController"
 */
export async function postUserOrgTenantTmpl4App(data: ExcelOrgUserSearchReq, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/user/org/tenant/tmpl4App`,
      method: 'post',
      data,
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
export async function getUserPageList(params: getUserPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseUserResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/user/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * (平台管理)用户管理 导入(平台/公司)人员
 * import { postUserPlatImport } from "/@/apis/gct-platform/UserController"
 */
export async function postUserPlatImport(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/user/plat/import`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (平台管理)用户管理 导出人员
 * import { postUserPlatTmpl } from "/@/apis/gct-platform/UserController"
 */
export async function postUserPlatTmpl(data: ExcelUserSearchReq, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/user/plat/tmpl`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改密码与签名密码
 * import { postUserResetAllpwd } from "/@/apis/gct-platform/UserController"
 */
export async function postUserResetAllpwd(data: UserCodeDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user/reset/allpwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重置登录密码
 * import { postUserResetDefaultPwd } from "/@/apis/gct-platform/UserController"
 */
export async function postUserResetDefaultPwd(data: UserIdsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user/reset/default/pwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 重置签名密码
 * import { postUserResetDefaultSignPwd } from "/@/apis/gct-platform/UserController"
 */
export async function postUserResetDefaultSignPwd(data: UserIdsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user/reset/default/signPwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改密码
 * import { postUserResetPwd } from "/@/apis/gct-platform/UserController"
 */
export async function postUserResetPwd(data: UserCodeDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user/reset/pwd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 用户设置
 * import { postUserSettings } from "/@/apis/gct-platform/UserController"
 */
export async function postUserSettings(data: UserSettingsDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user/settings`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)用户管理 导入(平台/公司)人员
 * import { postUserTenantImport } from "/@/apis/gct-platform/UserController"
 */
export async function postUserTenantImport(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/user/tenant/import`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)用户管理 导入(平台/公司)人员
 * import { postUserTenantImport4App } from "/@/apis/gct-platform/UserController"
 */
export async function postUserTenantImport4App(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/user/tenant/import4App`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)用户管理 导出人员
 * import { postUserTenantTmpl } from "/@/apis/gct-platform/UserController"
 */
export async function postUserTenantTmpl(data: ExcelUserSearchReq, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/user/tenant/tmpl`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * (租户管理后台)用户管理 导出人员
 * import { postUserTenantTmpl4App } from "/@/apis/gct-platform/UserController"
 */
export async function postUserTenantTmpl4App(data: ExcelUserSearchReq, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/user/tenant/tmpl4App`,
      method: 'post',
      data,
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
export async function putUserById(path: putUserByIdPathInterface, data: UserSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}