import request from '@mobile/utils/request';
import type { PageDesignerLogRequest, ResponseEntitystring, ResponseEntityPageDesignerLogResponse, ResponseEntityListPageDesignerLogResponse, ResponseEntityPageBasePageDesignerLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPageDesignerLog } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export async function postPageDesignerLog(data: PageDesignerLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/page-designer-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePageDesignerLog } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export interface deletePageDesignerLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePageDesignerLog(params: deletePageDesignerLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/page-designer-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPageDesignerLogInfo } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export interface getPageDesignerLogInfoQueryInterface {
  id: string; // id
}
export async function getPageDesignerLogInfo(params: getPageDesignerLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageDesignerLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/page-designer-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPageDesignerLogList } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export async function getPageDesignerLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPageDesignerLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/page-designer-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPageDesignerLogPageList } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export interface getPageDesignerLogPageListQueryInterface {
  endTime?: string; // 结束时间
  id?: string; // 主键id
  name?: string; // 页面名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  relationId?: string; // 管理数据id
  relationType?: number; // 类型（1 web、2 pda 、3 pad）
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getPageDesignerLogPageList(params: getPageDesignerLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePageDesignerLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/page-designer-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPageDesignerLogById } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export interface putPageDesignerLogByIdPathInterface {
  id: string; // id
}
export async function putPageDesignerLogById(path: putPageDesignerLogByIdPathInterface, data: PageDesignerLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/page-designer-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}