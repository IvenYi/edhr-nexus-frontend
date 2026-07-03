import { defHttp } from '@/utils/http/axios';
import { FlowExtRequest, ResponseEntitystring, ResponseEntityFlowExtResponse, ResponseEntityListFlowExtResponse, ResponseEntityPageBaseFlowExtResponse, ResponseEntityValidCronResponse } from './model/index';

/**
 * 保存
 * import { postFlowExt } from "/@/apis/gct-ipaas2/FlowExtController"
 */
export async function postFlowExt(data: FlowExtRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/flow-ext`,
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
 * import { deleteFlowExt } from "/@/apis/gct-ipaas2/FlowExtController"
 */
export interface deleteFlowExtQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteFlowExt(params: deleteFlowExtQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-ipaas/api/flow-ext`,
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
 * 根据fuuid查询上线的版本
 * import { getFlowExtFindByFuuid } from "/@/apis/gct-ipaas2/FlowExtController"
 */
export interface getFlowExtFindByFuuidQueryInterface {
  fuuid: string; // fuuid
}
export async function getFlowExtFindByFuuid(params: getFlowExtFindByFuuidQueryInterface = {}, config = {}): Promise<ResponseEntityFlowExtResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-ext/findByFuuid`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getFlowExtInfo } from "/@/apis/gct-ipaas2/FlowExtController"
 */
export interface getFlowExtInfoQueryInterface {
  id: string; // id
}
export async function getFlowExtInfo(params: getFlowExtInfoQueryInterface = {}, config = {}): Promise<ResponseEntityFlowExtResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-ext/info`,
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
 * import { getFlowExtList } from "/@/apis/gct-ipaas2/FlowExtController"
 */
export async function getFlowExtList(config = {}): Promise<ResponseEntityListFlowExtResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-ext/list`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getFlowExtPageList } from "/@/apis/gct-ipaas2/FlowExtController"
 */
export interface getFlowExtPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getFlowExtPageList(params: getFlowExtPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseFlowExtResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-ext/page/list`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 校验cron表达式
 * import { getFlowExtValidCron } from "/@/apis/gct-ipaas2/FlowExtController"
 */
export interface getFlowExtValidCronQueryInterface {
  cron: string; // cron
}
export async function getFlowExtValidCron(params: getFlowExtValidCronQueryInterface = {}, config = {}): Promise<ResponseEntityValidCronResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow-ext/validCron`,
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
 * import { putFlowExtById } from "/@/apis/gct-ipaas2/FlowExtController"
 */
export interface putFlowExtByIdPathInterface {
  id: string; // id
}
export async function putFlowExtById(path: putFlowExtByIdPathInterface, data: FlowExtRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow-ext/${path?.id}`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}