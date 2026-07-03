import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityListTraceSettingResponse, ResponseEntityTraceSettingResponse, TraceSettingRequest } from './model/index';

/**
 * 删除
 * import { deleteTraceSetting } from "/@/apis/gct-apaas/TraceSettingController"
 */
export interface deleteTraceSettingQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteTraceSetting(params: deleteTraceSettingQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/trace-setting`,
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
 * 列表
 * import { getTraceSettingList } from "/@/apis/gct-apaas/TraceSettingController"
 */
export async function getTraceSettingList(config = {}): Promise<ResponseEntityListTraceSettingResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-setting/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据模型key查询模型树
 * import { getTraceSettingTreeByModelKey } from "/@/apis/gct-apaas/TraceSettingController"
 */
export interface getTraceSettingTreeByModelKeyQueryInterface {
  modelKey: string; // modelKey
}
export async function getTraceSettingTreeByModelKey(params: getTraceSettingTreeByModelKeyQueryInterface = {}, config = {}): Promise<ResponseEntityTraceSettingResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/trace-setting/treeByModelKey`,
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
 * import { putTraceSettingById } from "/@/apis/gct-apaas/TraceSettingController"
 */
export interface putTraceSettingByIdPathInterface {
  id: string; // id
}
export async function putTraceSettingById(path: putTraceSettingByIdPathInterface, data: TraceSettingRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/trace-setting/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}