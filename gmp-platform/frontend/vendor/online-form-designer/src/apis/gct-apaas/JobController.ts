import { defHttp } from '@/utils/http/axios';
import { JobRequest, ResponseEntitystring, CronDTO, ResponseEntityJobResponse, ResponseEntityListJobResponse, ResponseEntityPageBaseJobResponse } from './model/index';

/**
 * 定时任务保存
 * import { postJob } from "/@/apis/gct-apaas/JobController"
 */
export async function postJob(data: JobRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/job`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteJob(params: deleteJobQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/job`,
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
 * cron 表达式校验
 * import { postJobCronValid } from "/@/apis/gct-apaas/JobController"
 */
export async function postJobCronValid(data: CronDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/job/cron/valid`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postJobExec(params: postJobExecQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/job/exec`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getJobInfo(params: getJobInfoQueryInterface = {}, config = {}): Promise<ResponseEntityJobResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/job/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getJobList(params: getJobListQueryInterface = {}, config = {}): Promise<ResponseEntityListJobResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/job/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getJobPageList(params: getJobPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseJobResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/job/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putJobStatusById(path: putJobStatusByIdPathInterface, params: putJobStatusByIdQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/job/status/${path?.id}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putJobById(path: putJobByIdPathInterface, data: JobRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/job/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}