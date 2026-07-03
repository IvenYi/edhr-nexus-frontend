import request from '@mobile/utils/request';
import type { ResponseEntitystring, UserRequest, ResponseEntityUserLoginResp, ResponseEntityUserResponse, ResponseEntityPasswordInfo, ResponseEntityListUserResponse, ResponseEntityobject, ExcelOrgUserSearchReq, ResponseEntityPageBaseUserResponse, ExcelUserSearchReq, UserIdsDTO, UserCodeDTO, UserSettingsDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 文件上传minio
 * import { postFileUploadImage } from "/@/apis/gct-platform/MinioController"
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
 * 保存
 * import { postUser } from "/@/apis/gct-platform/MinioController"
 */
export async function postUser(data: UserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
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
 * import { deleteUser } from "/@/apis/gct-platform/MinioController"
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
 * import { getUserInfo } from "/@/apis/gct-platform/MinioController"
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
 * import { getUserInfoById } from "/@/apis/gct-platform/MinioController"
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
 * 查询用户上次修改密码信息
 * import { getUserLastResetPwd } from "/@/apis/gct-platform/MinioController"
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
 * import { getUserList } from "/@/apis/gct-platform/MinioController"
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
 * import { getUserListByTenantId } from "/@/apis/gct-platform/MinioController"
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
 * import { postUserOrgPlatImport } from "/@/apis/gct-platform/MinioController"
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
 * import { postUserOrgPlatTmpl } from "/@/apis/gct-platform/MinioController"
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
 * import { postUserOrgTenantImport } from "/@/apis/gct-platform/MinioController"
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
 * (租户管理后台)组织成员 导出部门人员
 * import { postUserOrgTenantTmpl } from "/@/apis/gct-platform/MinioController"
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
 * 分页列表
 * import { getUserPageList } from "/@/apis/gct-platform/MinioController"
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
 * import { postUserPlatImport } from "/@/apis/gct-platform/MinioController"
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
 * import { postUserPlatTmpl } from "/@/apis/gct-platform/MinioController"
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
 * 重置密码
 * import { postUserResetDefaultPwd } from "/@/apis/gct-platform/MinioController"
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
 * 修改密码
 * import { postUserResetPwd } from "/@/apis/gct-platform/MinioController"
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
 * import { postUserSettings } from "/@/apis/gct-platform/MinioController"
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
 * import { postUserTenantImport } from "/@/apis/gct-platform/MinioController"
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
 * (租户管理后台)用户管理 导出人员
 * import { postUserTenantTmpl } from "/@/apis/gct-platform/MinioController"
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
 * 修改
 * import { putUserById } from "/@/apis/gct-platform/MinioController"
 */
export interface putUserByIdPathInterface {
  id: string; // id
}
export async function putUserById(path: putUserByIdPathInterface, data: UserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/user/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}