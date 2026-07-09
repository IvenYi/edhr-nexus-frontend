import request from '@mobile/utils/request';
import type { ModelPermissionRelationRequest, ResponseEntitystring, ResponseEntityModelPermissionRelationResponse, ResponseEntityListModelPermissionRelationResponse, ResponseEntityPageBaseModelPermissionRelationResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postModelPermissionRelation } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export async function postModelPermissionRelation(data: ModelPermissionRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-permission-relation`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteModelPermissionRelation } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export interface deleteModelPermissionRelationQueryInterface {
  id: string; // 删除的id
}
export async function deleteModelPermissionRelation(params: deleteModelPermissionRelationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-permission-relation`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getModelPermissionRelationInfo } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export interface getModelPermissionRelationInfoQueryInterface {
  id: string; // id
}
export async function getModelPermissionRelationInfo(params: getModelPermissionRelationInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelPermissionRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-permission-relation/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getModelPermissionRelationList } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export async function getModelPermissionRelationList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelPermissionRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-permission-relation/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getModelPermissionRelationPageList } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export interface getModelPermissionRelationPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getModelPermissionRelationPageList(params: getModelPermissionRelationPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseModelPermissionRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-permission-relation/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putModelPermissionRelationById } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export interface putModelPermissionRelationByIdPathInterface {
  id: string; // id
}
export async function putModelPermissionRelationById(path: putModelPermissionRelationByIdPathInterface, data: ModelPermissionRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model-permission-relation/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}