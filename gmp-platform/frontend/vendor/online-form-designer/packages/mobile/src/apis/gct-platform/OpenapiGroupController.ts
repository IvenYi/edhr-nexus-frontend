import request from '@mobile/utils/request';
import type { OpenapiGroupRequest, ResponseEntitystring, ResponseEntityOpenapiGroupResponse, ResponseEntityMapstringListOpenapiDto, ResponseEntityApiInfo, ResponseEntityPageBaseOpenapiResponse, ResponseEntityListOpenapiGroupResponse, ResponseEntityPageBaseOpenapiGroupResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postOpenapiGroup } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export async function postOpenapiGroup(data: OpenapiGroupRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteOpenapiGroup } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export interface deleteOpenapiGroupQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteOpenapiGroup(params: deleteOpenapiGroupQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 分组详情-基础信息
 * import { getOpenapiGroupInfo } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export interface getOpenapiGroupInfoQueryInterface {
  id: string; // id唯一标识
}
export async function getOpenapiGroupInfo(params: getOpenapiGroupInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOpenapiGroupResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分组详情-关联模型列表
 * import { getOpenapiGroupInfoAssociationModel } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export interface getOpenapiGroupInfoAssociationModelQueryInterface {
  appTag?: string; // 应用标识
  env?: string; // 环境
  name?: string; // 关联模型名称
}
export async function getOpenapiGroupInfoAssociationModel(params: getOpenapiGroupInfoAssociationModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMapstringListOpenapiDto['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group/info/associationModel`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分组详情-api管理列表-单个接口详情
 * import { getOpenapiGroupInfoOpenapiInfo } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export interface getOpenapiGroupInfoOpenapiInfoQueryInterface {
  appTag?: string; // 应用标识
  env?: string; // 环境
  id?: string; // 接口id
}
export async function getOpenapiGroupInfoOpenapiInfo(params: getOpenapiGroupInfoOpenapiInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityApiInfo['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group/info/openapi/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分组详情-api管理列表
 * import { getOpenapiGroupInfoPageList } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export interface getOpenapiGroupInfoPageListQueryInterface {
  appTag?: string; // 应用标识
  env?: string; // 环境
  key?: string; // 接口标识
  modelKey?: string; // 关联模型
  name?: string; // 接口名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getOpenapiGroupInfoPageList(params: getOpenapiGroupInfoPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOpenapiResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group/info/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getOpenapiGroupList } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export async function getOpenapiGroupList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOpenapiGroupResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分组PDF导出
 * import { getOpenapiGroupListDownload } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export interface getOpenapiGroupListDownloadQueryInterface {
  appTag?: string; // 应用标识
  env?: string; // 环境
}
export async function getOpenapiGroupListDownload(params: getOpenapiGroupListDownloadQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/openapi-group/list/download`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getOpenapiGroupPageList } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export interface getOpenapiGroupPageListQueryInterface {
  appId?: string; // 应用标识
  env?: string; // 环境
  name?: string; // 应用名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getOpenapiGroupPageList(params: getOpenapiGroupPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOpenapiGroupResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putOpenapiGroupById } from "/@/apis/gct-platform/OpenapiGroupController"
 */
export interface putOpenapiGroupByIdPathInterface {
  id: string; // id
}
export async function putOpenapiGroupById(path: putOpenapiGroupByIdPathInterface, data: OpenapiGroupRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/openapi-group/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}