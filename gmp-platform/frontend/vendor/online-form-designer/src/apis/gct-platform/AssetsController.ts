import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityAssetsResponse, ResponseEntityListAssetsResponse, ResponseEntityPageBaseAssetsResponse } from './model/index';

/**
 * 删除
 * import { deleteAssets } from "/@/apis/gct-platform/AssetsController"
 */
export interface deleteAssetsQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteAssets(params: deleteAssetsQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/assets`,
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
 * import { getAssetsInfo } from "/@/apis/gct-platform/AssetsController"
 */
export interface getAssetsInfoQueryInterface {
  id: string; // id
}
export async function getAssetsInfo(params: getAssetsInfoQueryInterface = {}, config = {}): Promise<ResponseEntityAssetsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/assets/info`,
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
 * import { getAssetsList } from "/@/apis/gct-platform/AssetsController"
 */
export interface getAssetsListQueryInterface {
  assetsModule?: string; // assetsModule
  categoryIds?: string; // categoryIds
  filename?: string; // filename
}
export async function getAssetsList(params: getAssetsListQueryInterface = {}, config = {}): Promise<ResponseEntityListAssetsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/assets/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postAssetsMoveByAssetIdCategoryByCategoryId(path: postAssetsMoveByAssetIdCategoryByCategoryIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/assets/move/${path?.assetId}/category/${path?.categoryId}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getAssetsPageList(params: getAssetsPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAssetsResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/assets/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postAssetsUploadByCategoryId(path: postAssetsUploadByCategoryIdPathInterface, data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/assets/upload/${path?.categoryId}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}