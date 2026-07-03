import { defHttp } from '@/utils/http/axios';
import { UserGroupRelationRequest, ResponseEntitystring, UserGroupRelationSaveBatchRequest } from './model/index';

/**
 * 保存
 * import { postUserGroupRelation } from "/@/apis/gct-apaas/UserGroupRelationController"
 */
export async function postUserGroupRelation(data: UserGroupRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/user-group-relation`,
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
 * import { deleteUserGroupRelation } from "/@/apis/gct-apaas/UserGroupRelationController"
 */
export interface deleteUserGroupRelationQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteUserGroupRelation(params: deleteUserGroupRelationQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/user-group-relation`,
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
 * 批量保存
 * import { postUserGroupRelationBatch } from "/@/apis/gct-apaas/UserGroupRelationController"
 */
export async function postUserGroupRelationBatch(data: UserGroupRelationSaveBatchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/user-group-relation/batch`,
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
 * import { putUserGroupRelationById } from "/@/apis/gct-apaas/UserGroupRelationController"
 */
export interface putUserGroupRelationByIdPathInterface {
  id: string; // id
}
export async function putUserGroupRelationById(path: putUserGroupRelationByIdPathInterface, data: UserGroupRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/user-group-relation/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}