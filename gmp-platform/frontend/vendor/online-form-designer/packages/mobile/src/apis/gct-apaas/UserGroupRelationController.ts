import request from '@mobile/utils/request';
import type { UserGroupRelationRequest, ResponseEntitystring, UserGroupRelationSaveBatchRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postUserGroupRelation } from "/@/apis/gct-apaas/UserGroupRelationController"
 */
export async function postUserGroupRelation(data: UserGroupRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group-relation`,
      method: 'post',
      data,
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
export async function deleteUserGroupRelation(params: deleteUserGroupRelationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group-relation`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 批量保存
 * import { postUserGroupRelationBatch } from "/@/apis/gct-apaas/UserGroupRelationController"
 */
export async function postUserGroupRelationBatch(data: UserGroupRelationSaveBatchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group-relation/batch`,
      method: 'post',
      data,
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
export async function putUserGroupRelationById(path: putUserGroupRelationByIdPathInterface, data: UserGroupRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/user-group-relation/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}