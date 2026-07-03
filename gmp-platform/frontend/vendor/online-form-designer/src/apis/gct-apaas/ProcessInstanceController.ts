import { defHttp } from '@/utils/http/axios';
import { ProcessInstanceRequest, ResponseEntitystring, ResponseEntityProcessInstanceResponse, ResponseEntityListProcessInstanceResponse, ResponseEntityPageBaseProcessInstanceResponse } from './model/index';

/**
 * 保存
 * import { postProcessInstance } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export async function postProcessInstance(data: ProcessInstanceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-instance`,
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
 * import { deleteProcessInstance } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export interface deleteProcessInstanceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessInstance(params: deleteProcessInstanceQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-instance`,
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
 * import { getProcessInstanceInfo } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export interface getProcessInstanceInfoQueryInterface {
  id: string; // id
}
export async function getProcessInstanceInfo(params: getProcessInstanceInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-instance/info`,
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
 * import { getProcessInstanceList } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export async function getProcessInstanceList(config = {}): Promise<ResponseEntityListProcessInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-instance/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessInstancePageList(params: getProcessInstancePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseProcessInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-instance/page/list`,
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
 * import { putProcessInstanceById } from "/@/apis/gct-apaas/ProcessInstanceController"
 */
export interface putProcessInstanceByIdPathInterface {
  id: string; // id
}
export async function putProcessInstanceById(path: putProcessInstanceByIdPathInterface, data: ProcessInstanceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-instance/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}