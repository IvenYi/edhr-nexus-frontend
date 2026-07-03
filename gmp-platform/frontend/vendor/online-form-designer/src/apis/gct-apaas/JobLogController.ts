import { defHttp } from '@/utils/http/axios';
import { ResponseEntityJobLogResponse, ResponseEntityListJobLogResponse, ResponseEntityPageBaseJobLogResponse } from './model/index';

/**
 * 详情
 * import { getJobLogInfo } from "/@/apis/gct-apaas/JobLogController"
 */
export interface getJobLogInfoQueryInterface {
  id: string; // id
}
export async function getJobLogInfo(params: getJobLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityJobLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/job-log/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getJobLogList } from "/@/apis/gct-apaas/JobLogController"
 */
export async function getJobLogList(config = {}): Promise<ResponseEntityListJobLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/job-log/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getJobLogPageList(params: getJobLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseJobLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/job-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}