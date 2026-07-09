import { defHttp } from '@/utils/http/axios';
import { PluginRequest, ResponseEntitystring, PackageJson, ResponseEntityboolean, ResponseEntityListPluginTenant, ResponseEntityPluginResponse, ResponseEntityListPluginResponse, ResponseEntityPageBasePluginResponse, ResponseEntityPackageJson } from './model/index';

/**
 * 保存
 * import { postPlugin } from "/@/apis/gct-platform/PluginController"
 */
export async function postPlugin(data: PluginRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plugin`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除插件及插件版本
 * import { deletePlugin } from "/@/apis/gct-platform/PluginController"
 */
export interface deletePluginQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePlugin(params: deletePluginQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/plugin`,
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
 * 取消上传文件
 * import { postPluginCancelUpload } from "/@/apis/gct-platform/PluginController"
 */
export async function postPluginCancelUpload(data: PackageJson, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plugin/cancelUpload`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除分类
 * import { putPluginDeleteCategory } from "/@/apis/gct-platform/PluginController"
 */
export async function putPluginDeleteCategory(data: PluginRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/plugin/deleteCategory`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取服务器存储的图片
 * import { getPluginGetImages } from "/@/apis/gct-platform/PluginController"
 */
export interface getPluginGetImagesQueryInterface {
  imageUrl: string; // imageUrl
}
export async function getPluginGetImages(params: getPluginGetImagesQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plugin/getImages`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取租户下的所有组件信息
 * import { postPluginGetTenantCompList } from "/@/apis/gct-platform/PluginController"
 */
export async function postPluginGetTenantCompList(data: PluginRequest, config = {}): Promise<ResponseEntityListPluginTenant['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plugin/getTenantCompList`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getPluginInfo } from "/@/apis/gct-platform/PluginController"
 */
export interface getPluginInfoQueryInterface {
  id: string; // id
}
export async function getPluginInfo(params: getPluginInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPluginResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plugin/info`,
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
 * import { getPluginList } from "/@/apis/gct-platform/PluginController"
 */
export async function getPluginList(config = {}): Promise<ResponseEntityListPluginResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plugin/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postPluginPageList } from "/@/apis/gct-platform/PluginController"
 */
export async function postPluginPageList(data: PluginRequest, config = {}): Promise<ResponseEntityPageBasePluginResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plugin/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 上传压缩文件
 * import { postPluginUploadZip } from "/@/apis/gct-platform/PluginController"
 */
export interface postPluginUploadZipQueryInterface {
  categoryId?: string; // 分类Id
  client?: string; // 支持客户端
  description?: string; // 版本说明
  icon?: string; // 组件图标
  id?: string; // id
  ids?: string; // ids
  key?: string; // 组件key
  keyWord?: string; // ...
  name?: string; // 最新名称
  pageNo?: number; // ...
  pageSize?: number; // ...
  readMe?: string; // ...
  screenShot?: string; // 组件截图
  tag?: string; // 标识
  tenantId?: string; // 租户ID
  tmpPath?: string; // ...
  url?: string; // 最新文件地址
  version?: string; // 最新版本号
  zipUrl?: string; // zip文件地址
}
export async function postPluginUploadZip(data: any, params: postPluginUploadZipQueryInterface = {}, config = {}): Promise<ResponseEntityPackageJson['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plugin/uploadZip`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPluginById } from "/@/apis/gct-platform/PluginController"
 */
export interface putPluginByIdPathInterface {
  id: string; // id
}
export async function putPluginById(path: putPluginByIdPathInterface, data: PluginRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/plugin/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}