import { defHttp } from '@/utils/http/axios';
import { LabelLogRequest, ResponseEntitystring, ResponseEntityLabelLogResponse, ResponseEntityListLabelLogResponse, ResponseEntityPageBaseLabelLogResponse } from './model/index';

/**
 * 保存
 * import { postLabelLog } from "/@/apis/gct-apaas/LabelLogController"
 */
export async function postLabelLog(data: LabelLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/label-log`,
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
 * import { deleteLabelLog } from "/@/apis/gct-apaas/LabelLogController"
 */
export interface deleteLabelLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteLabelLog(params: deleteLabelLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/label-log`,
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
 * import { getLabelLogInfo } from "/@/apis/gct-apaas/LabelLogController"
 */
export interface getLabelLogInfoQueryInterface {
  id: string; // id
}
export async function getLabelLogInfo(params: getLabelLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityLabelLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label-log/info`,
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
 * import { getLabelLogList } from "/@/apis/gct-apaas/LabelLogController"
 */
export async function getLabelLogList(config = {}): Promise<ResponseEntityListLabelLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label-log/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getLabelLogPageList(params: getLabelLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseLabelLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/label-log/page/list`,
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
 * import { putLabelLogById } from "/@/apis/gct-apaas/LabelLogController"
 */
export interface putLabelLogByIdPathInterface {
  id: string; // id
}
export async function putLabelLogById(path: putLabelLogByIdPathInterface, data: LabelLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/label-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}