import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityStartedProcessResponse, ResponseEntityPageBaseStartedProcessResponse, ResponseEntityListAppProcess } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteStartedProcess } from "/@/apis/gct-platform/StartedProcessController"
 */
export interface deleteStartedProcessQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteStartedProcess(params: deleteStartedProcessQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/started-process`,
      method: 'delete',
      params,
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
export async function getStartedProcessInfo(params: getStartedProcessInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityStartedProcessResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/started-process/info`,
      method: 'get',
      params,
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
export async function getStartedProcessPageList(params: getStartedProcessPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseStartedProcessResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/started-process/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我的流程
 * import { getStartedProcessProcess } from "/@/apis/gct-platform/StartedProcessController"
 */
export async function getStartedProcessProcess(config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppProcess['data']> {
  return request(
    {
      url: `/gct-platform/api/started-process/process`,
      method: 'get',
      ...config,
    },
  );
}