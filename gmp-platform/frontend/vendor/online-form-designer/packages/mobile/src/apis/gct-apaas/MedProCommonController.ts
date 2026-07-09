import request from '@mobile/utils/request';
import type { modelDataAssociationRequest, ResponseEntityobject, ResponseEntityboolean, ResponseEntityListModelAssociationResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 关联模型数据查询
 * import { postMedProModelMetaDataAssociation } from "/@/apis/gct-apaas/MedProCommonController"
 */
export async function postMedProModelMetaDataAssociation(data: modelDataAssociationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/medPro/modelMeta/dataAssociation`,
      method: 'post',
      data,
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
export async function getMedProModelMetaGetSysConfig(params: getMedProModelMetaGetSysConfigQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/medPro/modelMeta/getSysConfig`,
      method: 'get',
      params,
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
export async function getMedProModelMetaHasDataAssociation(params: getMedProModelMetaHasDataAssociationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/medPro/modelMeta/hasDataAssociation`,
      method: 'get',
      params,
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
export async function getMedProModelMetaModelDataAssociation(params: getMedProModelMetaModelDataAssociationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelAssociationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/medPro/modelMeta/modelDataAssociation`,
      method: 'get',
      params,
      ...config,
    },
  );
}