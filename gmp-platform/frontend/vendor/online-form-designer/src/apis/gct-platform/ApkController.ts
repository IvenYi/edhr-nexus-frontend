import { defHttp } from '@/utils/http/axios';
import { ApkRequest, ResponseEntitystring, ResponseEntityApkResponse, ResponseEntityListApkResponse } from './model/index';

/**
 * 保存
 * import { postApk } from "/@/apis/gct-platform/ApkController"
 */
export async function postApk(data: ApkRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/apk`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteApk } from "/@/apis/gct-platform/ApkController"
 */
export interface deleteApkQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteApk(params: deleteApkQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/apk`,
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
 * 获取激活版本数据信息
 * import { getApkGetActiveApp } from "/@/apis/gct-platform/ApkController"
 */
export async function getApkGetActiveApp(config = {}): Promise<ResponseEntityApkResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/apk/getActiveApp`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取IP
 * import { getApkGetIp } from "/@/apis/gct-platform/ApkController"
 */
export async function getApkGetIp(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/apk/getIp`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getApkInfo } from "/@/apis/gct-platform/ApkController"
 */
export interface getApkInfoQueryInterface {
  id: string; // id
}
export async function getApkInfo(params: getApkInfoQueryInterface = {}, config = {}): Promise<ResponseEntityApkResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/apk/info`,
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
 * import { getApkList } from "/@/apis/gct-platform/ApkController"
 */
export async function getApkList(config = {}): Promise<ResponseEntityListApkResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/apk/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 文件上传minio
 * import { postApkUploadApk } from "/@/apis/gct-platform/ApkController"
 */
export async function postApkUploadApk(data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/apk/upload/apk`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 激活版本
 * import { putApkById } from "/@/apis/gct-platform/ApkController"
 */
export interface putApkByIdPathInterface {
  id: string; // id
}
export async function putApkById(path: putApkByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/apk/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}