import { defHttp } from '@/utils/http/axios';
import { FlowAppReq, ResponseEntitystring, ResponseEntityFlowAppResponse, ResponseEntityListFlowAppResponse, ResponseEntityPageBaseFlowAppResponse, FlowAppRequest } from './model/index';

/**
 * 新建应用
 * import { postFlowApp } from "/@/apis/gct-ipaas2/FlowAppController"
 */
export async function postFlowApp(data: FlowAppReq, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow-app`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteFlowApp } from "/@/apis/gct-ipaas2/FlowAppController"
 */
export interface deleteFlowAppQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteFlowApp(params: deleteFlowAppQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-ipaas/api/flow-app`,
      params,
    },
    {
      joinUserToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getFlowAppInfo } from "/@/apis/gct-ipaas2/FlowAppController"
 */
export interface getFlowAppInfoQueryInterface {
  id: string; // id
}
export async function getFlowAppInfo(params: getFlowAppInfoQueryInterface = {}, config = {}): Promise<ResponseEntityFlowAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-app/info`,
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
 * import { getFlowAppList } from "/@/apis/gct-ipaas2/FlowAppController"
 */
export async function getFlowAppList(config = {}): Promise<ResponseEntityListFlowAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-app/list`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getFlowAppPageList } from "/@/apis/gct-ipaas2/FlowAppController"
 */
export interface getFlowAppPageListQueryInterface {
  categoryId: string; // 分类id
  keyword?: string; // 根据名称,KEY 搜索
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getFlowAppPageList(params: getFlowAppPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseFlowAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-app/page/list`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putFlowAppById } from "/@/apis/gct-ipaas2/FlowAppController"
 */
export interface putFlowAppByIdPathInterface {
  id: string; // id
}
export async function putFlowAppById(path: putFlowAppByIdPathInterface, data: FlowAppRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow-app/${path?.id}`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}