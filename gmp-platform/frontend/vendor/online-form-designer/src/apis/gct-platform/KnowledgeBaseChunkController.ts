import { defHttp } from '@/utils/http/axios';
import { KnowledgeBaseChunkRequest, ResponseEntitystring, ResponseEntityKnowledgeBaseChunkResponse, ResponseEntityListKnowledgeBaseChunkResponse, ResponseEntityPageBaseKnowledgeBaseChunkResponse } from './model/index';

/**
 * 保存
 * import { postKnowledgeBaseChunk } from "/@/apis/gct-platform/KnowledgeBaseChunkController"
 */
export async function postKnowledgeBaseChunk(data: KnowledgeBaseChunkRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/knowledge-base-chunk`,
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
 * import { deleteKnowledgeBaseChunk } from "/@/apis/gct-platform/KnowledgeBaseChunkController"
 */
export interface deleteKnowledgeBaseChunkQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteKnowledgeBaseChunk(params: deleteKnowledgeBaseChunkQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/knowledge-base-chunk`,
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
 * import { getKnowledgeBaseChunkInfo } from "/@/apis/gct-platform/KnowledgeBaseChunkController"
 */
export interface getKnowledgeBaseChunkInfoQueryInterface {
  id: string; // id
}
export async function getKnowledgeBaseChunkInfo(params: getKnowledgeBaseChunkInfoQueryInterface = {}, config = {}): Promise<ResponseEntityKnowledgeBaseChunkResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base-chunk/info`,
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
 * import { getKnowledgeBaseChunkList } from "/@/apis/gct-platform/KnowledgeBaseChunkController"
 */
export async function getKnowledgeBaseChunkList(config = {}): Promise<ResponseEntityListKnowledgeBaseChunkResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base-chunk/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getKnowledgeBaseChunkPageList } from "/@/apis/gct-platform/KnowledgeBaseChunkController"
 */
export interface getKnowledgeBaseChunkPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getKnowledgeBaseChunkPageList(params: getKnowledgeBaseChunkPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseKnowledgeBaseChunkResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base-chunk/page/list`,
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
 * import { putKnowledgeBaseChunkById } from "/@/apis/gct-platform/KnowledgeBaseChunkController"
 */
export interface putKnowledgeBaseChunkByIdPathInterface {
  id: string; // id
}
export async function putKnowledgeBaseChunkById(path: putKnowledgeBaseChunkByIdPathInterface, data: KnowledgeBaseChunkRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/knowledge-base-chunk/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}