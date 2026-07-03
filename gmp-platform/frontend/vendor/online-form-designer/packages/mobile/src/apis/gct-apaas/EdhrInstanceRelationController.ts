import request from '@mobile/utils/request';
import type { EdhrInstanceRelationRequest, ResponseEntitystring, ResponseEntityListChildEdhrInstanceRelationDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postEdhrInstanceRelation } from "/@/apis/gct-apaas/EdhrInstanceRelationController"
 */
export async function postEdhrInstanceRelation(data: EdhrInstanceRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance-relation`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteEdhrInstanceRelation } from "/@/apis/gct-apaas/EdhrInstanceRelationController"
 */
export interface deleteEdhrInstanceRelationQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEdhrInstanceRelation(params: deleteEdhrInstanceRelationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance-relation`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 子实例列表
 * import { getEdhrInstanceRelationListTree } from "/@/apis/gct-apaas/EdhrInstanceRelationController"
 */
export interface getEdhrInstanceRelationListTreeQueryInterface {
  instId: string; // 实例 id
}
export async function getEdhrInstanceRelationListTree(params: getEdhrInstanceRelationListTreeQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListChildEdhrInstanceRelationDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance-relation/list/tree`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 子实例列表
 * import { getEdhrInstanceRelationListChild } from "/@/apis/gct-apaas/EdhrInstanceRelationController"
 */
export interface getEdhrInstanceRelationListChildQueryInterface {
  instId: string; // 实例 id
}
export async function getEdhrInstanceRelationListChild(params: getEdhrInstanceRelationListChildQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListChildEdhrInstanceRelationDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance-relation/listChild`,
      method: 'get',
      params,
      ...config,
    },
  );
}