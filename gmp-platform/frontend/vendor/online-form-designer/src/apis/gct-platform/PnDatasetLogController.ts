import { defHttp } from '@/utils/http/axios';
import { PnDatasetLogRequest, ResponseEntitystring, ResponseEntityPnDatasetLogResponse, ResponseEntityListPnDatasetLogResponse, ResponseEntityPageBasePnDatasetLogResponse } from './model/index';

/**
 * 保存
 * import { postDatasetLog } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export async function postDatasetLog(data: PnDatasetLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/dataset-log`,
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
 * import { deleteDatasetLog } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface deleteDatasetLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDatasetLog(params: deleteDatasetLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/dataset-log`,
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
 * import { getDatasetLogInfo } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface getDatasetLogInfoQueryInterface {
  id: string; // id
}
export async function getDatasetLogInfo(params: getDatasetLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPnDatasetLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset-log/info`,
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
 * import { getDatasetLogList } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface getDatasetLogListQueryInterface {
  datasetId?: string; // datasetId
}
export async function getDatasetLogList(params: getDatasetLogListQueryInterface = {}, config = {}): Promise<ResponseEntityListPnDatasetLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset-log/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDatasetLogPageList(params: getDatasetLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePnDatasetLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/dataset-log/page/list`,
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
 * import { putDatasetLogById } from "/@/apis/gct-platform/PnDatasetLogController"
 */
export interface putDatasetLogByIdPathInterface {
  id: string; // id
}
export async function putDatasetLogById(path: putDatasetLogByIdPathInterface, data: PnDatasetLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/dataset-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}