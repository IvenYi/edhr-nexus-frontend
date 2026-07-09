import request from '@mobile/utils/request';
import type { PmProcessInstanceRequest, ResponseEntitystring, ResponseEntityPmProcessInstanceResponse, ResponseEntityListPmProcessInstanceResponse, ResponseEntityPageBasePmProcessInstanceResponse, ResponseEntityListAppProcess } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPmProcessInstance } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export async function postPmProcessInstance(data: PmProcessInstanceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-instance`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePmProcessInstance } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export interface deletePmProcessInstanceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessInstance(params: deletePmProcessInstanceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-instance`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPmProcessInstanceInfo } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export interface getPmProcessInstanceInfoQueryInterface {
  id: string; // id
}
export async function getPmProcessInstanceInfo(params: getPmProcessInstanceInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmProcessInstanceResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-instance/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPmProcessInstanceList } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export async function getPmProcessInstanceList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPmProcessInstanceResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-instance/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmProcessInstancePageList } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export interface getPmProcessInstancePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
  processTitle?: string; // 流程标题
  status?: string; // 状态
}
export async function getPmProcessInstancePageList(params: getPmProcessInstancePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePmProcessInstanceResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-instance/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getPmProcessInstanceProcess } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export async function getPmProcessInstanceProcess(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppProcess['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-instance/process`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPmProcessInstanceById } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export interface putPmProcessInstanceByIdPathInterface {
  id: string; // id
}
export async function putPmProcessInstanceById(path: putPmProcessInstanceByIdPathInterface, data: PmProcessInstanceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-instance/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}