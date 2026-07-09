import { defHttp } from '@/utils/http/axios';
import { EdhrInstanceRelationRequest, ResponseEntitystring, ResponseEntityListChildEdhrInstanceRelationDTO } from './model/index';

/**
 * 保存
 * import { postEdhrInstanceRelation } from "/@/apis/gct-apaas/EdhrInstanceRelationController"
 */
export async function postEdhrInstanceRelation(data: EdhrInstanceRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/edhr-instance-relation`,
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
 * import { deleteEdhrInstanceRelation } from "/@/apis/gct-apaas/EdhrInstanceRelationController"
 */
export interface deleteEdhrInstanceRelationQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEdhrInstanceRelation(params: deleteEdhrInstanceRelationQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/edhr-instance-relation`,
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
 * 子实例列表
 * import { getEdhrInstanceRelationListTree } from "/@/apis/gct-apaas/EdhrInstanceRelationController"
 */
export interface getEdhrInstanceRelationListTreeQueryInterface {
  instId: string; // 实例 id
}
export async function getEdhrInstanceRelationListTree(params: getEdhrInstanceRelationListTreeQueryInterface = {}, config = {}): Promise<ResponseEntityListChildEdhrInstanceRelationDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-instance-relation/list/tree`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getEdhrInstanceRelationListChild(params: getEdhrInstanceRelationListChildQueryInterface = {}, config = {}): Promise<ResponseEntityListChildEdhrInstanceRelationDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-instance-relation/listChild`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}