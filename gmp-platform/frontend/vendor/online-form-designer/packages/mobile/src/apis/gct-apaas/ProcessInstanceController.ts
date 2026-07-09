import request from '@mobile/utils/request';
import type { ProcessInstanceRequest, ResponseEntitystring, ResponseEntityProcessInstanceResponse, ResponseEntityListProcessInstanceResponse, ResponseEntityPageBaseProcessInstanceResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessInstance } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export async function postProcessInstance(data: ProcessInstanceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessInstance } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export interface deleteProcessInstanceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessInstance(params: deleteProcessInstanceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessInstanceInfo } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export interface getProcessInstanceInfoQueryInterface {
  id: string; // id
}
export async function getProcessInstanceInfo(params: getProcessInstanceInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessInstanceList } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export async function getProcessInstanceList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getProcessInstancePageList } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export interface getProcessInstancePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getProcessInstancePageList(params: getProcessInstancePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseProcessInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessInstanceById } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export interface putProcessInstanceByIdPathInterface {
  id: string; // id
}
export async function putProcessInstanceById(path: putProcessInstanceByIdPathInterface, data: ProcessInstanceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-instance/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}