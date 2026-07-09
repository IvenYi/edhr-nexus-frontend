import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityAssetsResponse, ResponseEntityListAssetsResponse, ResponseEntityPageBaseAssetsResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteAssets } from "/@/apis/gct-platform/AssetsController"
 */
export interface deleteAssetsQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAssets(params: deleteAssetsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/assets`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getAssetsInfo } from "/@/apis/gct-platform/AssetsController"
 */
export interface getAssetsInfoQueryInterface {
  id: string; // id
}
export async function getAssetsInfo(params: getAssetsInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAssetsResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/assets/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAssetsList } from "/@/apis/gct-platform/AssetsController"
 */
export interface getAssetsListQueryInterface {
  assetsModule?: string; // assetsModule
  categoryIds?: string; // categoryIds
  filename?: string; // filename
}
export async function getAssetsList(params: getAssetsListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListAssetsResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/assets/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改文件夹
 * import { postAssetsMoveByAssetIdCategoryByCategoryId } from "/@/apis/gct-platform/AssetsController"
 */
export interface postAssetsMoveByAssetIdCategoryByCategoryIdPathInterface {
  assetId: string; // assetId
  categoryId: string; // categoryId
}
export async function postAssetsMoveByAssetIdCategoryByCategoryId(path: postAssetsMoveByAssetIdCategoryByCategoryIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/assets/move/${path?.assetId}/category/${path?.categoryId}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAssetsPageList } from "/@/apis/gct-platform/AssetsController"
 */
export interface getAssetsPageListQueryInterface {
  assetsModule?: string; // assetsModule
  categoryIds?: string; // categoryIds
  filename?: string; // filename
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getAssetsPageList(params: getAssetsPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAssetsResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/assets/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 文件上传minio
 * import { postAssetsUploadByCategoryId } from "/@/apis/gct-platform/AssetsController"
 */
export interface postAssetsUploadByCategoryIdPathInterface {
  categoryId: string; // categoryId
}
export async function postAssetsUploadByCategoryId(path: postAssetsUploadByCategoryIdPathInterface, data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/assets/upload/${path?.categoryId}`,
      method: 'post',
      data,
      ...config,
    },
  );
}