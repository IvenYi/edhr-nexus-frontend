import { defHttp } from '@/utils/http/axios';
import { PmProcessInstanceRequest, ResponseEntitystring, ResponseEntityPmProcessInstanceResponse, ResponseEntityListPmProcessInstanceResponse, ResponseEntityPageBasePmProcessInstanceResponse, ResponseEntityListAppProcess } from './model/index';

/**
 * 保存
 * import { postPmProcessInstance } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export async function postPmProcessInstance(data: PmProcessInstanceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pm-process-instance`,
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
 * import { deletePmProcessInstance } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export interface deletePmProcessInstanceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessInstance(params: deletePmProcessInstanceQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/pm-process-instance`,
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
 * import { getPmProcessInstanceInfo } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export interface getPmProcessInstanceInfoQueryInterface {
  id: string; // id
}
export async function getPmProcessInstanceInfo(params: getPmProcessInstanceInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPmProcessInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-instance/info`,
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
 * import { getPmProcessInstanceList } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export async function getPmProcessInstanceList(config = {}): Promise<ResponseEntityListPmProcessInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-instance/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPmProcessInstancePageList(params: getPmProcessInstancePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePmProcessInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-instance/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getPmProcessInstanceProcess } from "/@/apis/gct-platform/PmProcessInstanceController"
 */
export async function getPmProcessInstanceProcess(config = {}): Promise<ResponseEntityListAppProcess['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-instance/process`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putPmProcessInstanceById(path: putPmProcessInstanceByIdPathInterface, data: PmProcessInstanceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/pm-process-instance/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}