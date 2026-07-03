import request from '@mobile/utils/request';
import type { PnDatasetLogRequest, ResponseEntitystring, ResponseEntityPnDatasetLogResponse, ResponseEntityListPnDatasetLogResponse, ResponseEntityPageBasePnDatasetLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDatasetLog } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export async function postDatasetLog(data: PnDatasetLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDatasetLog } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface deleteDatasetLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasetLog(params: deleteDatasetLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getDatasetLogInfo } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface getDatasetLogInfoQueryInterface {
  id: string; // id
}
export async function getDatasetLogInfo(params: getDatasetLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPnDatasetLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDatasetLogList } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface getDatasetLogListQueryInterface {
  datasetId?: string; // datasetId
}
export async function getDatasetLogList(params: getDatasetLogListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPnDatasetLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset-log/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDatasetLogPageList } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface getDatasetLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDatasetLogPageList(params: getDatasetLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePnDatasetLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDatasetLogById } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface putDatasetLogByIdPathInterface {
  id: string; // id
}
export async function putDatasetLogById(path: putDatasetLogByIdPathInterface, data: PnDatasetLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/dataset-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}