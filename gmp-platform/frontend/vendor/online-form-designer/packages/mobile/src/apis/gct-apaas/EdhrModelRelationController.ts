import request from '@mobile/utils/request';
import type { ResponseEntityEdhrDocRelationResponse, EdhrInstanceRequest, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 查询大纲和edhr实例 - 根据记录标识
 * import { getEdhrModelRelationGetInstanceByMaterialNo } from "/@/apis/gct-apaas/EdhrModelRelationController"
 */
export interface getEdhrModelRelationGetInstanceByMaterialNoQueryInterface {
  ignoreOutline?: number; // 是否忽略大纲（0/1，默认0）
  materialNo: string; // 记录标识
}
export async function getEdhrModelRelationGetInstanceByMaterialNo(params: getEdhrModelRelationGetInstanceByMaterialNoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrDocRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-model-relation/getInstanceByMaterialNo`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 创建edhr实例以及其下关联之所有表单实例
 * import { postEdhrModelRelationInsertEdhrInstanceAndOfInstance } from "/@/apis/gct-apaas/EdhrModelRelationController"
 */
export async function postEdhrModelRelationInsertEdhrInstanceAndOfInstance(data: EdhrInstanceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-model-relation/insertEdhrInstanceAndOfInstance`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据批次号新增放行单
 * import { getEdhrModelRelationInsertProductReleaseByMaterialNo } from "/@/apis/gct-apaas/EdhrModelRelationController"
 */
export interface getEdhrModelRelationInsertProductReleaseByMaterialNoQueryInterface {
  materialNo: string; // 批次号
}
export async function getEdhrModelRelationInsertProductReleaseByMaterialNo(params: getEdhrModelRelationInsertProductReleaseByMaterialNoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-model-relation/insertProductReleaseByMaterialNo`,
      method: 'get',
      params,
      ...config,
    },
  );
}