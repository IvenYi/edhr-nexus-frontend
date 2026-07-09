import { defHttp } from '@/utils/http/axios';
import { ResponseEntity, ResponseEntityListFlowCategoryTree, ResponseEntityboolean, ResponseEntityPageBaseFlowMainResp, ResponseEntityListFlowMainResp } from './model/index';

/**
 * 导出
 * import { postFlowExport } from "/@/apis/gct-ipaas2/FlowMainController"
 */
export async function postFlowExport(data: string[], config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow/export`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 流程和分类关联树
 * import { getFlowFlowCategoryTree } from "/@/apis/gct-ipaas2/FlowMainController"
 */
export async function getFlowFlowCategoryTree(config = {}): Promise<ResponseEntityListFlowCategoryTree['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/flowCategoryTree`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 导入
 * import { postFlowImport } from "/@/apis/gct-ipaas2/FlowMainController"
 */
export interface postFlowImportQueryInterface {
  categoryId: string; // 分类id
}
export async function postFlowImport(data: any, params: postFlowImportQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow/import`,
      params,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 分类下的已上线的连接流 - 只返回触发类型为webhook的
 * import { getFlowListCategoryOnline } from "/@/apis/gct-ipaas2/FlowMainController"
 */
export interface getFlowListCategoryOnlineQueryInterface {
  categoryId: string; // 分类id
  keyword?: string; // 根据名称,KEY 搜索
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getFlowListCategoryOnline(params: getFlowListCategoryOnlineQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseFlowMainResp['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/list/category/online`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getFlowListOnline } from "/@/apis/gct-ipaas2/FlowMainController"
 */
export interface getFlowListOnlineQueryInterface {
  name?: string; // name
}
export async function getFlowListOnline(params: getFlowListOnlineQueryInterface = {}, config = {}): Promise<ResponseEntityListFlowMainResp['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/list/online`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getFlowPageList } from "/@/apis/gct-ipaas2/FlowMainController"
 */
export interface getFlowPageListQueryInterface {
  categoryId: string; // 分类id
  keyword?: string; // 根据名称,KEY 搜索
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getFlowPageList(params: getFlowPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseFlowMainResp['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/page/list`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}