import { defHttp } from '@/utils/http/axios';
import { KnowledgeBaseDocRequest, ResponseEntitystring, ResponseEntityKnowledgeBaseDocResponse, ResponseEntityListKnowledgeBaseDocResponse, ResponseEntityPageBaseKnowledgeBaseDocResponse } from './model/index';

/**
 * 保存
 * import { postKnowledgeBaseDoc } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export async function postKnowledgeBaseDoc(data: KnowledgeBaseDocRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/knowledge-base-doc`,
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
 * import { deleteKnowledgeBaseDoc } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export interface deleteKnowledgeBaseDocQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteKnowledgeBaseDoc(params: deleteKnowledgeBaseDocQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/knowledge-base-doc`,
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
 * import { getKnowledgeBaseDocInfo } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export interface getKnowledgeBaseDocInfoQueryInterface {
  id: string; // id
}
export async function getKnowledgeBaseDocInfo(params: getKnowledgeBaseDocInfoQueryInterface = {}, config = {}): Promise<ResponseEntityKnowledgeBaseDocResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base-doc/info`,
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
 * import { getKnowledgeBaseDocList } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export async function getKnowledgeBaseDocList(config = {}): Promise<ResponseEntityListKnowledgeBaseDocResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base-doc/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getKnowledgeBaseDocPageList(params: getKnowledgeBaseDocPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseKnowledgeBaseDocResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base-doc/page/list`,
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
 * import { putKnowledgeBaseDocById } from "/@/apis/gct-platform/KnowledgeBaseDocController"
 */
export interface putKnowledgeBaseDocByIdPathInterface {
  id: string; // id
}
export async function putKnowledgeBaseDocById(path: putKnowledgeBaseDocByIdPathInterface, data: KnowledgeBaseDocRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/knowledge-base-doc/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}