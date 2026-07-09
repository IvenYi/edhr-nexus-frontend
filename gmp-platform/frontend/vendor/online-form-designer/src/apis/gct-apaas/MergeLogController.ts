import { defHttp } from '@/utils/http/axios';
import { MergeLogRequest, ResponseEntitystring, ResponseEntityMergeLogResponse, ResponseEntityListMergeLogResponse } from './model/index';

/**
 * 保存
 * import { postMergeLog } from "/@/apis/gct-apaas/MergeLogController"
 */
export async function postMergeLog(data: MergeLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/merge-log`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteMergeLog } from "/@/apis/gct-apaas/MergeLogController"
 */
export interface deleteMergeLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMergeLog(params: deleteMergeLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/merge-log`,
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
 * 详情
 * import { getMergeLogInfo } from "/@/apis/gct-apaas/MergeLogController"
 */
export interface getMergeLogInfoQueryInterface {
  id: string; // id
}
export async function getMergeLogInfo(params: getMergeLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityMergeLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/merge-log/info`,
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
 * import { getMergeLogList } from "/@/apis/gct-apaas/MergeLogController"
 */
export async function getMergeLogList(config = {}): Promise<ResponseEntityListMergeLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/merge-log/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putMergeLogById } from "/@/apis/gct-apaas/MergeLogController"
 */
export interface putMergeLogByIdPathInterface {
  id: string; // id
}
export async function putMergeLogById(path: putMergeLogByIdPathInterface, data: MergeLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/merge-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}