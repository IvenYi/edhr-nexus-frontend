import request from '@mobile/utils/request';
import type { ResponseEntityPageBaseEnumModelFieldResponse, ResponseEntityGetAppResponse, ResponseEntityListPickerOrgDTO, ResponseEntityPageBasePickerUserDTO, ResponseEntityListPickerUserDTO, ResponseEntityListModelBriefInfo, ResponseEntitystring, ResponseEntityUserOfAppDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 设计态查询枚举字段
 * import { getDesignerCommonEnumModelFieldList } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export interface getDesignerCommonEnumModelFieldListQueryInterface {
  endTime?: string; // 结束时间
  enumModelId?: string; // 枚举模型id
  enumModelKey?: string; // 枚举模型Key
  id?: string; // 枚举字段id
  pageNo?: number; // 页码
  pageSize?: number; // 一页条数，覆盖父类默认值
  searchKey?: string; // 枚举文本/枚举值
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  text?: string; // 枚举文本
  value?: string; // 枚举值
}
export async function getDesignerCommonEnumModelFieldList(params: getDesignerCommonEnumModelFieldListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEnumModelFieldResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/enumModelField/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取应用信息
 * import { getDesignerCommonGetApp } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export async function getDesignerCommonGetApp(config:AxiosRequestConfig = {}): Promise<ResponseEntityGetAppResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/getApp`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取应用可使用组织
 * import { getDesignerCommonGetCanBeUsedOrg } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export async function getDesignerCommonGetCanBeUsedOrg(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/getCanBeUsedOrg`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取应用可使用组织下的人员
 * import { getDesignerCommonGetCanBeUsedOrgUser } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export interface getDesignerCommonGetCanBeUsedOrgUserQueryInterface {
  allUserOption?: number; // 是否显示主部门与下级部门所有人员
  appUserGranted?: number; // 应用用户是否授权
  fieldKey?: string; // 字段 key，不涉及字段的情况下不用传
  ignoreCase?: number; // 是否忽略大小写
  ignoreEnabled?: number; // 是否忽略用户状态
  keyword?: string; // 关键字
  keywordFields?: array; // 关键字筛选字段
  modelKey?: string; // 模型 key，不涉及字段的情况下不用传
  orgId?: string; // 部门id
  orgIds?: array; // 部门id，多个的情况
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  userGroupIds?: array; // 用户组id
  userName?: string; // 查询的用户姓名或账号
}
export async function getDesignerCommonGetCanBeUsedOrgUser(params: getDesignerCommonGetCanBeUsedOrgUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/getCanBeUsedOrgUser`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取用户组下的人员
 * import { getDesignerCommonGetUserGroupUser } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export interface getDesignerCommonGetUserGroupUserQueryInterface {
  allUserOption?: number; // 是否显示主部门与下级部门所有人员
  appUserGranted?: number; // 应用用户是否授权
  fieldKey?: string; // 字段 key，不涉及字段的情况下不用传
  ignoreCase?: number; // 是否忽略大小写
  ignoreEnabled?: number; // 是否忽略用户状态
  keyword?: string; // 关键字
  keywordFields?: array; // 关键字筛选字段
  modelKey?: string; // 模型 key，不涉及字段的情况下不用传
  orgId?: string; // 部门id
  orgIds?: array; // 部门id，多个的情况
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  userGroupIds?: array; // 用户组id
  userName?: string; // 查询的用户姓名或账号
}
export async function getDesignerCommonGetUserGroupUser(params: getDesignerCommonGetUserGroupUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/getUserGroupUser`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取应用可见组织
 * import { getDesignerCommonGetVisibleOrg } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export async function getDesignerCommonGetVisibleOrg(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerOrgDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/getVisibleOrg`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取应用可见组织下的人员
 * import { getDesignerCommonGetVisibleOrgUser } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export interface getDesignerCommonGetVisibleOrgUserQueryInterface {
  allUserOption?: number; // 是否显示主部门与下级部门所有人员
  appUserGranted?: number; // 应用用户是否授权
  fieldKey?: string; // 字段 key，不涉及字段的情况下不用传
  ignoreCase?: number; // 是否忽略大小写
  ignoreEnabled?: number; // 是否忽略用户状态
  keyword?: string; // 关键字
  keywordFields?: array; // 关键字筛选字段
  modelKey?: string; // 模型 key，不涉及字段的情况下不用传
  orgId?: string; // 部门id
  orgIds?: array; // 部门id，多个的情况
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  userGroupIds?: array; // 用户组id
  userName?: string; // 查询的用户姓名或账号
}
export async function getDesignerCommonGetVisibleOrgUser(params: getDesignerCommonGetVisibleOrgUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePickerUserDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/getVisibleOrgUser`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取应用可见用户
 * import { getDesignerCommonGetVisibleUser } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export async function getDesignerCommonGetVisibleUser(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/getVisibleUser`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取应用可见用户与可见组织下的用户
 * import { getDesignerCommonGetVisibleUserAndVisibleOrgUser } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export interface getDesignerCommonGetVisibleUserAndVisibleOrgUserQueryInterface {
  allUserOption?: number; // 是否显示主部门与下级部门所有人员
  appUserGranted?: number; // 应用用户是否授权
  fieldKey?: string; // 字段 key，不涉及字段的情况下不用传
  ignoreCase?: number; // 是否忽略大小写
  ignoreEnabled?: number; // 是否忽略用户状态
  keyword?: string; // 关键字
  keywordFields?: array; // 关键字筛选字段
  modelKey?: string; // 模型 key，不涉及字段的情况下不用传
  orgId?: string; // 部门id
  orgIds?: array; // 部门id，多个的情况
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  userGroupIds?: array; // 用户组id
  userName?: string; // 查询的用户姓名或账号
}
export async function getDesignerCommonGetVisibleUserAndVisibleOrgUser(params: getDesignerCommonGetVisibleUserAndVisibleOrgUserQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/getVisibleUserAndVisibleOrgUser`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取指定组织人员
 * import { getDesignerCommonListUserByIds } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export interface getDesignerCommonListUserByIdsQueryInterface {
  fieldKey?: string; // 字段 key
  ids?: array; // ids
  modelKey?: string; // 模型 key
}
export async function getDesignerCommonListUserByIds(params: getDesignerCommonListUserByIdsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPickerUserDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/listUserByIds`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 模型列表
 * import { getDesignerCommonTableEntityModelList } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export interface getDesignerCommonTableEntityModelListQueryInterface {
  subModel?: number; // 模型是否为子模型 不传查询全部(1 子模型, 0 非子模型)
  type?: string; // 模型标志:(NDO/RDO) 多个类型逗号分隔
}
export async function getDesignerCommonTableEntityModelList(params: getDesignerCommonTableEntityModelListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelBriefInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/table-entity-model/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 应用文件上传
 * import { postDesignerCommonUploadFile } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export interface postDesignerCommonUploadFileQueryInterface {
  type?: string; // type
}
export async function postDesignerCommonUploadFile(data: undefined, params: postDesignerCommonUploadFileQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/upload/file`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 上传标签图片
 * import { postDesignerCommonUploadLabelImage } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export async function postDesignerCommonUploadLabelImage(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/upload/label/image`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取用户角色权限组
 * import { getDesignerCommonUserInfo } from "/@/apis/gct-apaas/DesignerCommonController"
 */
export async function getDesignerCommonUserInfo(config:AxiosRequestConfig = {}): Promise<ResponseEntityUserOfAppDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/designer-common/user/info`,
      method: 'get',
      ...config,
    },
  );
}