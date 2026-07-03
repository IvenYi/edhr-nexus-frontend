import request from '@mobile/utils/request';
import type { ApkRequest, ResponseEntitystring, ResponseEntityApkResponse, ResponseEntityListApkResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postApk } from "/@/apis/gct-platform/ApkController"
 */
export async function postApk(data: ApkRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/apk`,
      method: 'post',
      data,
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
export async function deleteApk(params: deleteApkQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/apk`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 获取激活版本数据信息
 * import { getApkGetActiveApp } from "/@/apis/gct-platform/ApkController"
 */
export async function getApkGetActiveApp(config:AxiosRequestConfig = {}): Promise<ResponseEntityApkResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/apk/getActiveApp`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取IP
 * import { getApkGetIp } from "/@/apis/gct-platform/ApkController"
 */
export async function getApkGetIp(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/apk/getIp`,
      method: 'get',
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
export async function getApkInfo(params: getApkInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityApkResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/apk/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getApkList } from "/@/apis/gct-platform/ApkController"
 */
export async function getApkList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListApkResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/apk/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 文件上传minio
 * import { postApkUploadApk } from "/@/apis/gct-platform/ApkController"
 */
export async function postApkUploadApk(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/apk/upload/apk`,
      method: 'post',
      data,
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
export async function putApkById(path: putApkByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/apk/${path?.id}`,
      method: 'put',
      ...config,
    },
  );
}