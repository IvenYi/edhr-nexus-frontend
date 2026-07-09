import { defHttp } from '@/utils/http/axios';
import { ModelPermissionRelationRequest, ResponseEntitystring, ResponseEntityModelPermissionRelationResponse, ResponseEntityListModelPermissionRelationResponse, ResponseEntityPageBaseModelPermissionRelationResponse } from './model/index';

/**
 * 保存
 * import { postModelPermissionRelation } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export async function postModelPermissionRelation(data: ModelPermissionRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/model-permission-relation`,
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
 * import { deleteModelPermissionRelation } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export interface deleteModelPermissionRelationQueryInterface {
  id: string; // 删除的id
}
export async function deleteModelPermissionRelation(params: deleteModelPermissionRelationQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/model-permission-relation`,
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
 * 详情
 * import { getModelPermissionRelationInfo } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export interface getModelPermissionRelationInfoQueryInterface {
  id: string; // id
}
export async function getModelPermissionRelationInfo(params: getModelPermissionRelationInfoQueryInterface = {}, config = {}): Promise<ResponseEntityModelPermissionRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-permission-relation/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getModelPermissionRelationList } from "/@/apis/gct-apaas/ModelPermissionRelationController"
 */
export async function getModelPermissionRelationList(config = {}): Promise<ResponseEntityListModelPermissionRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-permission-relation/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getModelPermissionRelationPageList(params: getModelPermissionRelationPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseModelPermissionRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/model-permission-relation/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putModelPermissionRelationById(path: putModelPermissionRelationByIdPathInterface, data: ModelPermissionRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/model-permission-relation/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}