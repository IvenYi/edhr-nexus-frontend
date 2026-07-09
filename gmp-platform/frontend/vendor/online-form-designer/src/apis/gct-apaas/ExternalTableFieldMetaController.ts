import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 移除单据模板字段元数据
 * import { getFieldMetaRemoveDocument } from "/@/apis/gct-apaas/ExternalTableFieldMetaController"
 */
export interface getFieldMetaRemoveDocumentQueryInterface {
  appId?: string; // appId
  branchId?: string; // branchId
  env?: string; // env
}
export async function getFieldMetaRemoveDocument(params: getFieldMetaRemoveDocumentQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/field-meta/remove/document`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteFieldRemove(params: deleteFieldRemoveQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/field/remove`,
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
 * 删除实体模型,支持多个
 * import { deleteModelRemove } from "/@/apis/gct-apaas/ExternalTableFieldMetaController"
 */
export interface deleteModelRemoveQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteModelRemove(params: deleteModelRemoveQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/model/remove`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}