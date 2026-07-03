import request from '@mobile/utils/request';
import type { KnowledgeBaseDocRequest, ResponseEntitystring, ResponseEntityKnowledgeBaseDocResponse, ResponseEntityListKnowledgeBaseDocResponse, ResponseEntityPageBaseKnowledgeBaseDocResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postKnowledgeBaseDoc } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export async function postKnowledgeBaseDoc(data: KnowledgeBaseDocRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-doc`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteKnowledgeBaseDoc } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export interface deleteKnowledgeBaseDocQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteKnowledgeBaseDoc(params: deleteKnowledgeBaseDocQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-doc`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getKnowledgeBaseDocInfo } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export interface getKnowledgeBaseDocInfoQueryInterface {
  id: string; // id
}
export async function getKnowledgeBaseDocInfo(params: getKnowledgeBaseDocInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityKnowledgeBaseDocResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-doc/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getKnowledgeBaseDocList } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export async function getKnowledgeBaseDocList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListKnowledgeBaseDocResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-doc/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getKnowledgeBaseDocPageList } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export interface getKnowledgeBaseDocPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getKnowledgeBaseDocPageList(params: getKnowledgeBaseDocPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseKnowledgeBaseDocResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-doc/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putKnowledgeBaseDocById } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export interface putKnowledgeBaseDocByIdPathInterface {
  id: string; // id
}
export async function putKnowledgeBaseDocById(path: putKnowledgeBaseDocByIdPathInterface, data: KnowledgeBaseDocRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/knowledge-base-doc/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}