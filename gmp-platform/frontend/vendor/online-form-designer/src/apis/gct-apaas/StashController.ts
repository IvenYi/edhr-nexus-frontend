import { defHttp } from '@/utils/http/axios';
import { StashRequest, ResponseEntitystring, ResponseEntityStashResponse } from './model/index';

/**
 * 保存
 * import { postStash } from "/@/apis/gct-apaas/StashController"
 */
export async function postStash(data: StashRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/stash`,
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
 * import { deleteStash } from "/@/apis/gct-apaas/StashController"
 */
export interface deleteStashQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteStash(params: deleteStashQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/stash`,
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
 * 根据 clientKey 查找
 * import { getStashFindByClientKey } from "/@/apis/gct-apaas/StashController"
 */
export interface getStashFindByClientKeyQueryInterface {
  clientKey: string; // clientKey
}
export async function getStashFindByClientKey(params: getStashFindByClientKeyQueryInterface = {}, config = {}): Promise<ResponseEntityStashResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/stash/findByClientKey`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getStashInfo } from "/@/apis/gct-apaas/StashController"
 */
export interface getStashInfoQueryInterface {
  id: string; // id
}
export async function getStashInfo(params: getStashInfoQueryInterface = {}, config = {}): Promise<ResponseEntityStashResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/stash/info`,
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
 * import { putStashById } from "/@/apis/gct-apaas/StashController"
 */
export interface putStashByIdPathInterface {
  id: string; // id
}
export async function putStashById(path: putStashByIdPathInterface, data: StashRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/stash/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}