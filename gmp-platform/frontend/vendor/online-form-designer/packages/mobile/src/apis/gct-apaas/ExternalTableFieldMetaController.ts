import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 移除单据模板字段元数据
 * import { getFieldMetaRemoveDocument } from "/@/apis/gct-apaas/ExternalTableFieldMetaController"
 */
export interface getFieldMetaRemoveDocumentQueryInterface {
  appId?: string; // appId
  branchId?: string; // branchId
  env?: string; // env
}
export async function getFieldMetaRemoveDocument(params: getFieldMetaRemoveDocumentQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field-meta/remove/document`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 删除模型字段,支持多个
 * import { deleteFieldRemove } from "/@/apis/gct-apaas/ExternalTableFieldMetaController"
 */
export interface deleteFieldRemoveQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteFieldRemove(params: deleteFieldRemoveQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/field/remove`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 删除实体模型,支持多个
 * import { deleteModelRemove } from "/@/apis/gct-apaas/ExternalTableFieldMetaController"
 */
export interface deleteModelRemoveQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModelRemove(params: deleteModelRemoveQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/model/remove`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}