import request from '@mobile/utils/request';
import type { DataCollectionInstanceAbandonRequest, ResponseEntityboolean, DataCollectionOnlineFormInstanceRequest, ResponseEntitystring, ResponseEntityListOnlineFormInstanceResponse, DataCollectionOnlineFormInstanceUpdateRequest, DataCollectionTaskUpdateStatusRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 作废表单
 * import { postOnlineFormInstanceDataCollectionAbandon } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export async function postOnlineFormInstanceDataCollectionAbandon(data: DataCollectionInstanceAbandonRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/abandon`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 创建数据采集表单实例
 * import { postOnlineFormInstanceDataCollectionCreate } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export async function postOnlineFormInstanceDataCollectionCreate(data: DataCollectionOnlineFormInstanceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/create`,
      method: 'post',
      data,
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
export async function getOnlineFormInstanceDataCollectionListAll(params: getOnlineFormInstanceDataCollectionListAllQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/listAll`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 更新表单实例别名
 * import { postOnlineFormInstanceDataCollectionUpdateAlias } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export async function postOnlineFormInstanceDataCollectionUpdateAlias(data: DataCollectionOnlineFormInstanceUpdateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/update-alias`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 更新数据采集任务状态
 * import { postOnlineFormInstanceDataCollectionUpdateStatus } from "/@/apis/gct-apaas/MedProFormInstanceController"
 */
export async function postOnlineFormInstanceDataCollectionUpdateStatus(data: DataCollectionTaskUpdateStatusRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-instance/data-collection/update-status`,
      method: 'post',
      data,
      ...config,
    },
  );
}