import { defHttp } from '@/utils/http/axios';
import { AgentRequest, ResponseEntitystring, ResponseEntityAgentResponse, ResponseEntityListAgentResponse, ResponseEntityPageBaseAgentResponse } from './model/index';

/**
 * 保存
 * import { postAgent } from "/@/apis/gct-platform/AgentController"
 */
export async function postAgent(data: AgentRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/agent`,
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
 * import { deleteAgent } from "/@/apis/gct-platform/AgentController"
 */
export interface deleteAgentQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAgent(params: deleteAgentQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/agent`,
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
 * import { getAgentInfo } from "/@/apis/gct-platform/AgentController"
 */
export interface getAgentInfoQueryInterface {
  id: string; // id
}
export async function getAgentInfo(params: getAgentInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAgentResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/agent/info`,
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
 * import { getAgentList } from "/@/apis/gct-platform/AgentController"
 */
export async function getAgentList(config = {}): Promise<ResponseEntityListAgentResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/agent/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getAgentPageList(params: getAgentPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAgentResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/agent/page/list`,
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
 * import { putAgentById } from "/@/apis/gct-platform/AgentController"
 */
export interface putAgentByIdPathInterface {
  id: string; // id
}
export async function putAgentById(path: putAgentByIdPathInterface, data: AgentRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/agent/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}