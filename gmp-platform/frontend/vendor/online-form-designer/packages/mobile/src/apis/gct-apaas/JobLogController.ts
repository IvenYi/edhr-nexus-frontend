import request from '@mobile/utils/request';
import type { ResponseEntityJobLogResponse, ResponseEntityListJobLogResponse, ResponseEntityPageBaseJobLogResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 详情
 * import { getJobLogInfo } from "/@/apis/gct-apaas/JobLogController"
 */
export interface getJobLogInfoQueryInterface {
  id: string; // id
}
export async function getJobLogInfo(params: getJobLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityJobLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/job-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getJobLogList } from "/@/apis/gct-apaas/JobLogController"
 */
export async function getJobLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListJobLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/job-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页查询日志列表
 * import { getJobLogPageList } from "/@/apis/gct-apaas/JobLogController"
 */
export interface getJobLogPageListQueryInterface {
  endTime?: string; // 触发截止时间
  keyword?: string; // 定时任务名称搜索
  operator?: string; // 操作人
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  startTime?: string; // 触发开始时间
  status?: string; // 触发结果(成功 SUCCEED/失败 FAILURE)
  triggerMode?: string; // 触发方式(手动触发 MANUAL/定时触发 AUTO)
}
export async function getJobLogPageList(params: getJobLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseJobLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/job-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}