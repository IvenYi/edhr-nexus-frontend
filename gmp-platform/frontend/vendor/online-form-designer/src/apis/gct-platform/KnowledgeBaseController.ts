import { defHttp } from '@/utils/http/axios';
import { KnowledgeBaseRequest, ResponseEntitystring, ResponseEntityKnowledgeBaseResponse, ResponseEntityListKnowledgeBaseResponse, ResponseEntityPageBaseKnowledgeBaseResponse } from './model/index';

/**
 * 保存
 * import { postKnowledgeBase } from "/@/apis/gct-platform/KnowledgeBaseController"
 */
export async function postKnowledgeBase(data: KnowledgeBaseRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/knowledge-base`,
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
 * import { deleteKnowledgeBase } from "/@/apis/gct-platform/KnowledgeBaseController"
 */
export interface deleteKnowledgeBaseQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteKnowledgeBase(params: deleteKnowledgeBaseQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/knowledge-base`,
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
 * import { getKnowledgeBaseInfo } from "/@/apis/gct-platform/KnowledgeBaseController"
 */
export interface getKnowledgeBaseInfoQueryInterface {
  id: string; // id
}
export async function getKnowledgeBaseInfo(params: getKnowledgeBaseInfoQueryInterface = {}, config = {}): Promise<ResponseEntityKnowledgeBaseResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base/info`,
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
 * import { getKnowledgeBaseList } from "/@/apis/gct-platform/KnowledgeBaseController"
 */
export async function getKnowledgeBaseList(config = {}): Promise<ResponseEntityListKnowledgeBaseResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getKnowledgeBasePageList } from "/@/apis/gct-platform/KnowledgeBaseController"
 */
export interface getKnowledgeBasePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getKnowledgeBasePageList(params: getKnowledgeBasePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseKnowledgeBaseResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/knowledge-base/page/list`,
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
 * import { putKnowledgeBaseById } from "/@/apis/gct-platform/KnowledgeBaseController"
 */
export interface putKnowledgeBaseByIdPathInterface {
  id: string; // id
}
export async function putKnowledgeBaseById(path: putKnowledgeBaseByIdPathInterface, data: KnowledgeBaseRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/knowledge-base/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}