import request from '@mobile/utils/request';
import type { AgentRequest, ResponseEntitystring, ResponseEntityAgentResponse, ResponseEntityListAgentResponse, ResponseEntityPageBaseAgentResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postAgent } from "/@/apis/gct-platform/AgentController"
 */
export async function postAgent(data: AgentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/agent`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteAgent } from "/@/apis/gct-platform/AgentController"
 */
export interface deleteAgentQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAgent(params: deleteAgentQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/agent`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getAgentInfo } from "/@/apis/gct-platform/AgentController"
 */
export interface getAgentInfoQueryInterface {
  id: string; // id
}
export async function getAgentInfo(params: getAgentInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAgentResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/agent/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAgentList } from "/@/apis/gct-platform/AgentController"
 */
export async function getAgentList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAgentResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/agent/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAgentPageList } from "/@/apis/gct-platform/AgentController"
 */
export interface getAgentPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAgentPageList(params: getAgentPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAgentResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/agent/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAgentById } from "/@/apis/gct-platform/AgentController"
 */
export interface putAgentByIdPathInterface {
  id: string; // id
}
export async function putAgentById(path: putAgentByIdPathInterface, data: AgentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/agent/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}