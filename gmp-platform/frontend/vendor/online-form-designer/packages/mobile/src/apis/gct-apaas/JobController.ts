import request from '@mobile/utils/request';
import type { JobRequest, ResponseEntitystring, CronDTO, ResponseEntityJobResponse, ResponseEntityListJobResponse, ResponseEntityPageBaseJobResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 定时任务保存
 * import { postJob } from "/@/apis/gct-apaas/JobController"
 */
export async function postJob(data: JobRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/job`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 定时任务删除
 * import { deleteJob } from "/@/apis/gct-apaas/JobController"
 */
export interface deleteJobQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteJob(params: deleteJobQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/job`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * cron 表达式校验
 * import { postJobCronValid } from "/@/apis/gct-apaas/JobController"
 */
export async function postJobCronValid(data: CronDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/job/cron/valid`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 单次触发定时任务
 * import { postJobExec } from "/@/apis/gct-apaas/JobController"
 */
export interface postJobExecQueryInterface {
  id: string; // 定时任务id
}
export async function postJobExec(params: postJobExecQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/job/exec`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * 定时任务详情
 * import { getJobInfo } from "/@/apis/gct-apaas/JobController"
 */
export interface getJobInfoQueryInterface {
  id: string; // id
}
export async function getJobInfo(params: getJobInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityJobResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/job/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 定时任务列表
 * import { getJobList } from "/@/apis/gct-apaas/JobController"
 */
export interface getJobListQueryInterface {
  keyword?: string; // 查询条件
}
export async function getJobList(params: getJobListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListJobResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/job/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 定时任务分页列表
 * import { getJobPageList } from "/@/apis/gct-apaas/JobController"
 */
export interface getJobPageListQueryInterface {
  keyword?: string; // 定时任务名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  resourceName?: string; // 触发方式服务名称
  resourceType?: string; // 触发方式(js脚本:SCRIPT_SERVICE/服务编排:SO_SERVICE)
  status?: string; // 状态(启用 ENABLED/禁用 DISABLED)
  triggerPolicy?: string; // 触发类型(单次触发 ONCE/重复触发 REPEAT/ CRON)
}
export async function getJobPageList(params: getJobPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseJobResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/job/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 定时任务启用禁用
 * import { putJobStatusById } from "/@/apis/gct-apaas/JobController"
 */
export interface putJobStatusByIdPathInterface {
  id: string; // id
}
export interface putJobStatusByIdQueryInterface {
  status: string; // 启用禁用 ENABLED/DISABLED
}
export async function putJobStatusById(path: putJobStatusByIdPathInterface, params: putJobStatusByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/job/status/${path?.id}`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 定时任务修改
 * import { putJobById } from "/@/apis/gct-apaas/JobController"
 */
export interface putJobByIdPathInterface {
  id: string; // id
}
export async function putJobById(path: putJobByIdPathInterface, data: JobRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/job/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}