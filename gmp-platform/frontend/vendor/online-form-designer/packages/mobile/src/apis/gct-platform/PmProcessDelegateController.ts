import request from '@mobile/utils/request';
import type { PmProcessDelegateRequest, ResponseEntitystring, ResponseEntityPmProcessDelegateResponse, ResponseEntityListPmProcessDelegateResponse, ResponseEntityPageBasePmProcessDelegateResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPmProcessDelegate } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export async function postPmProcessDelegate(data: PmProcessDelegateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePmProcessDelegate } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export interface deletePmProcessDelegateQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessDelegate(params: deletePmProcessDelegateQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPmProcessDelegateInfo } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export interface getPmProcessDelegateInfoQueryInterface {
  id: string; // id
}
export async function getPmProcessDelegateInfo(params: getPmProcessDelegateInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPmProcessDelegateResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPmProcessDelegateList } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export async function getPmProcessDelegateList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPmProcessDelegateResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmProcessDelegatePageList } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export interface getPmProcessDelegatePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPmProcessDelegatePageList(params: getPmProcessDelegatePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePmProcessDelegateResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPmProcessDelegateById } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export interface putPmProcessDelegateByIdPathInterface {
  id: string; // id
}
export async function putPmProcessDelegateById(path: putPmProcessDelegateByIdPathInterface, data: PmProcessDelegateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pm-process-delegate/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}