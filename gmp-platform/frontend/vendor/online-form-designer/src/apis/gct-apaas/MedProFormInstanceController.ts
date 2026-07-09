import { defHttp } from '@/utils/http/axios';
import { DataCollectionInstanceAbandonRequest, ResponseEntityboolean, DataCollectionOnlineFormInstanceRequest, ResponseEntitystring, ResponseEntityListOnlineFormInstanceResponse, DataCollectionOnlineFormInstanceUpdateRequest, DataCollectionTaskUpdateStatusRequest } from './model/index';

/**
 * 作废表单
 * import { postOnlineFormInstanceDataCollectionAbandon } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export async function postOnlineFormInstanceDataCollectionAbandon(data: DataCollectionInstanceAbandonRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/abandon`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 创建数据采集表单实例
 * import { postOnlineFormInstanceDataCollectionCreate } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export async function postOnlineFormInstanceDataCollectionCreate(data: DataCollectionOnlineFormInstanceRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/create`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据数据采集任务id获取所有表单实例
 * import { getOnlineFormInstanceDataCollectionListAll } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export interface getOnlineFormInstanceDataCollectionListAllQueryInterface {
  dataCollectionTaskId: string; // dataCollectionTaskId
}
export async function getOnlineFormInstanceDataCollectionListAll(params: getOnlineFormInstanceDataCollectionListAllQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormInstanceResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/listAll`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 更新表单实例别名
 * import { postOnlineFormInstanceDataCollectionUpdateAlias } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export async function postOnlineFormInstanceDataCollectionUpdateAlias(data: DataCollectionOnlineFormInstanceUpdateRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/update-alias`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 更新数据采集任务状态
 * import { postOnlineFormInstanceDataCollectionUpdateStatus } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export async function postOnlineFormInstanceDataCollectionUpdateStatus(data: DataCollectionTaskUpdateStatusRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/update-status`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}