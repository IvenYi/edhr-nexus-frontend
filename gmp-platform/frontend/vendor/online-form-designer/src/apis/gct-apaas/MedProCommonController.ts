import { defHttp } from '@/utils/http/axios';
import { modelDataAssociationRequest, ResponseEntityobject, ResponseEntityboolean, ResponseEntityListModelAssociationResponse } from './model/index';

/**
 * 关联模型数据查询
 * import { postMedProModelMetaDataAssociation } from "/@/apis/gct-apaas/MedProCommonController"
 */
export async function postMedProModelMetaDataAssociation(data: modelDataAssociationRequest, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/medPro/modelMeta/dataAssociation`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取系统配置
 * import { getMedProModelMetaGetSysConfig } from "/@/apis/gct-apaas/MedProCommonController"
 */
export interface getMedProModelMetaGetSysConfigQueryInterface {
  key: string; // key
}
export async function getMedProModelMetaGetSysConfig(params: getMedProModelMetaGetSysConfigQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/medPro/modelMeta/getSysConfig`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 存在关联数据
 * import { getMedProModelMetaHasDataAssociation } from "/@/apis/gct-apaas/MedProCommonController"
 */
export interface getMedProModelMetaHasDataAssociationQueryInterface {
  id: string; // id
  modelKey: string; // modelKey
}
export async function getMedProModelMetaHasDataAssociation(params: getMedProModelMetaHasDataAssociationQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/medPro/modelMeta/hasDataAssociation`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 关联数据信息列表
 * import { getMedProModelMetaModelDataAssociation } from "/@/apis/gct-apaas/MedProCommonController"
 */
export interface getMedProModelMetaModelDataAssociationQueryInterface {
  id: string; // id
  modelKey: string; // modelKey
}
export async function getMedProModelMetaModelDataAssociation(params: getMedProModelMetaModelDataAssociationQueryInterface = {}, config = {}): Promise<ResponseEntityListModelAssociationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/medPro/modelMeta/modelDataAssociation`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}