import request from '@mobile/utils/request';
import type { KnowledgeBaseChunkRequest, ResponseEntitystring, ResponseEntityKnowledgeBaseChunkResponse, ResponseEntityListKnowledgeBaseChunkResponse, ResponseEntityPageBaseKnowledgeBaseChunkResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postKnowledgeBaseChunk } from "/@/apis/gct-platform/KnowledgeBaseChunkController"
 */
export async function postKnowledgeBaseChunk(data: KnowledgeBaseChunkRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-chunk`,
      method: 'post',
      data,
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
export async function deleteKnowledgeBaseChunk(params: deleteKnowledgeBaseChunkQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-chunk`,
      method: 'delete',
      params,
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
export async function getKnowledgeBaseChunkInfo(params: getKnowledgeBaseChunkInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityKnowledgeBaseChunkResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-chunk/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getKnowledgeBaseChunkList } from "/@/apis/gct-platform/KnowledgeBaseChunkController"
 */
export async function getKnowledgeBaseChunkList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListKnowledgeBaseChunkResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-chunk/list`,
      method: 'get',
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
export async function getKnowledgeBaseChunkPageList(params: getKnowledgeBaseChunkPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseKnowledgeBaseChunkResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-chunk/page/list`,
      method: 'get',
      params,
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
export async function putKnowledgeBaseChunkById(path: putKnowledgeBaseChunkByIdPathInterface, data: KnowledgeBaseChunkRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-chunk/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}