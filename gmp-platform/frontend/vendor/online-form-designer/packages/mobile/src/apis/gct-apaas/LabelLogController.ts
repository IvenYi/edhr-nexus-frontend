import request from '@mobile/utils/request';
import type { LabelLogRequest, ResponseEntitystring, ResponseEntityLabelLogResponse, ResponseEntityListLabelLogResponse, ResponseEntityPageBaseLabelLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postLabelLog } from "/@/apis/gct-apaas/LabelLogController"
 */
export async function postLabelLog(data: LabelLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteLabelLog } from "/@/apis/gct-apaas/LabelLogController"
 */
export interface deleteLabelLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteLabelLog(params: deleteLabelLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getLabelLogInfo } from "/@/apis/gct-apaas/LabelLogController"
 */
export interface getLabelLogInfoQueryInterface {
  id: string; // id
}
export async function getLabelLogInfo(params: getLabelLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityLabelLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getLabelLogList } from "/@/apis/gct-apaas/LabelLogController"
 */
export async function getLabelLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListLabelLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getLabelLogPageList } from "/@/apis/gct-apaas/LabelLogController"
 */
export interface getLabelLogPageListQueryInterface {
  endTime?: string; // 结束时间
  labelKey?: string; // 标签key
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getLabelLogPageList(params: getLabelLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseLabelLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/label-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putLabelLogById } from "/@/apis/gct-apaas/LabelLogController"
 */
export interface putLabelLogByIdPathInterface {
  id: string; // id
}
export async function putLabelLogById(path: putLabelLogByIdPathInterface, data: LabelLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/label-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}