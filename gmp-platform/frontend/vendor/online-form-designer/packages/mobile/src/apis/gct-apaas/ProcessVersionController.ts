import request from '@mobile/utils/request';
import type { ProcessVersionRequest, ResponseEntitystring, DeployRequest, ResponseEntityProcessVersionResponse, ResponseEntityListProcessVersionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postProcessVersion } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export async function postProcessVersion(data: ProcessVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-version`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessVersion } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export interface deleteProcessVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessVersion(params: deleteProcessVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-version`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 激活版本
 * import { postProcessVersionActivateById } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export interface postProcessVersionActivateByIdPathInterface {
  id: string; // id
}
export async function postProcessVersionActivateById(path: postProcessVersionActivateByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-version/activate/${path?.id}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 保存部署流程
 * import { putProcessVersionDeploy } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export async function putProcessVersionDeploy(data: DeployRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-version/deploy`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessVersionInfo } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export interface getProcessVersionInfoQueryInterface {
  id: string; // id
  includeXml: boolean; // includeXml
}
export async function getProcessVersionInfo(params: getProcessVersionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-version/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessVersionList } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export interface getProcessVersionListQueryInterface {
  processId: string; // processId
}
export async function getProcessVersionList(params: getProcessVersionListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-version/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}