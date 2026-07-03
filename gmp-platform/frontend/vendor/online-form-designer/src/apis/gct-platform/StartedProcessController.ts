import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityStartedProcessResponse, ResponseEntityPageBaseStartedProcessResponse, ResponseEntityListAppProcess } from './model/index';

/**
 * 删除
 * import { deleteStartedProcess } from "/@/apis/gct-platform/StartedProcessController"
 */
export interface deleteStartedProcessQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteStartedProcess(params: deleteStartedProcessQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/started-process`,
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
 * import { getStartedProcessInfo } from "/@/apis/gct-platform/StartedProcessController"
 */
export interface getStartedProcessInfoQueryInterface {
  id: string; // id
}
export async function getStartedProcessInfo(params: getStartedProcessInfoQueryInterface = {}, config = {}): Promise<ResponseEntityStartedProcessResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/started-process/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getStartedProcessPageList } from "/@/apis/gct-platform/StartedProcessController"
 */
export interface getStartedProcessPageListQueryInterface {
  finished?: boolean; // 已完成
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  processId?: string; // 流程ID
  processTitle?: string; // 流程标题
}
export async function getStartedProcessPageList(params: getStartedProcessPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseStartedProcessResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/started-process/page/list`,
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
 * import { getStartedProcessProcess } from "/@/apis/gct-platform/StartedProcessController"
 */
export async function getStartedProcessProcess(config = {}): Promise<ResponseEntityListAppProcess['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/started-process/process`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}