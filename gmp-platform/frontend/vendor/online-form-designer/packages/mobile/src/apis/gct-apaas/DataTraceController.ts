import request from '@mobile/utils/request';
import type { DataTraceRequest, ResponseEntitystring, ResponseEntityDataTraceResponse, ResponseEntityListDataTraceResponse, ResponseEntityListUserBaseInfo, ResponseEntityPageBaseDataTraceResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDataTrace } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function postDataTrace(data: DataTraceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-trace`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDataTrace } from "/@/apis/gct-apaas/DataTraceController"
 */
export interface deleteDataTraceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDataTrace(params: deleteDataTraceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-trace`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 导出
 * import { postDataTraceExport } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function postDataTraceExport(data: DataTraceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-trace/export`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDataTraceInfo } from "/@/apis/gct-apaas/DataTraceController"
 */
export interface getDataTraceInfoQueryInterface {
  id: string; // id
}
export async function getDataTraceInfo(params: getDataTraceInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDataTraceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-trace/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDataTraceList } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function getDataTraceList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListDataTraceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-trace/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 操作人
 * import { getDataTraceOperators } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function getDataTraceOperators(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserBaseInfo['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-trace/operators`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postDataTracePageList } from "/@/apis/gct-apaas/DataTraceController"
 */
export async function postDataTracePageList(data: DataTraceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDataTraceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-trace/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDataTraceById } from "/@/apis/gct-apaas/DataTraceController"
 */
export interface putDataTraceByIdPathInterface {
  id: string; // id
}
export async function putDataTraceById(path: putDataTraceByIdPathInterface, data: DataTraceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-trace/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}