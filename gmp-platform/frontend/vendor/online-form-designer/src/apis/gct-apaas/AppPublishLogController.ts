import { defHttp } from '@/utils/http/axios';
import { AppPublishLogRequest, ResponseEntitystring, ResponseEntityAppPublishLogResponse, ResponseEntityListAppPublishLogResponse, ResponseEntityPageBaseAppPublishLogResponse } from './model/index';

/**
 * 保存
 * import { postAppPublishLog } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export async function postAppPublishLog(data: AppPublishLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/app-publish-log`,
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
 * import { deleteAppPublishLog } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export interface deleteAppPublishLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAppPublishLog(params: deleteAppPublishLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/app-publish-log`,
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
 * import { getAppPublishLogInfo } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export interface getAppPublishLogInfoQueryInterface {
  id: string; // id
}
export async function getAppPublishLogInfo(params: getAppPublishLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAppPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-publish-log/info`,
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
 * import { getAppPublishLogList } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export async function getAppPublishLogList(config = {}): Promise<ResponseEntityListAppPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-publish-log/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppPublishLogPageList } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export interface getAppPublishLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAppPublishLogPageList(params: getAppPublishLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/app-publish-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putAppPublishLogById } from "/@/apis/gct-apaas/AppPublishLogController"
 */
export interface putAppPublishLogByIdPathInterface {
  id: string; // id
}
export async function putAppPublishLogById(path: putAppPublishLogByIdPathInterface, data: AppPublishLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/app-publish-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}