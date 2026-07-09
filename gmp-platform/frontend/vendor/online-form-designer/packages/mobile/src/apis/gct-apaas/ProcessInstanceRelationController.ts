import request from '@mobile/utils/request';
import type { ProcessInstanceRelationRequest, ResponseEntitystring, ResponseEntityProcessInstanceRelationResponse, ResponseEntityListProcessInstanceRelationResponse, ResponseEntityPageBaseProcessInstanceRelationResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessInstanceRelation- } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export async function postProcessInstanceRelation-(data: ProcessInstanceRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance-relation-`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessInstanceRelation- } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export interface deleteProcessInstanceRelation-QueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessInstanceRelation-(params: deleteProcessInstanceRelation-QueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance-relation-`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessInstanceRelation-Info } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export interface getProcessInstanceRelation-InfoQueryInterface {
  id: string; // id
}
export async function getProcessInstanceRelation-Info(params: getProcessInstanceRelation-InfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessInstanceRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance-relation-/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessInstanceRelation-List } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export async function getProcessInstanceRelation-List(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessInstanceRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance-relation-/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessInstanceRelation-PageList } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export interface getProcessInstanceRelation-PageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessInstanceRelation-PageList(params: getProcessInstanceRelation-PageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessInstanceRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance-relation-/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessInstanceRelation-ById } from "/@/apis/gct-apaas/ProcessInstanceRelationController"
 */
export interface putProcessInstanceRelation-ByIdPathInterface {
  id: string; // id
}
export async function putProcessInstanceRelation-ById(path: putProcessInstanceRelation-ByIdPathInterface, data: ProcessInstanceRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance-relation-/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}