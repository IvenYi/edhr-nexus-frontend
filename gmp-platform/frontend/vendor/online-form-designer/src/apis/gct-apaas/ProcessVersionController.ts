import { defHttp } from '@/utils/http/axios';
import { ProcessVersionRequest, ResponseEntitystring, DeployRequest, ResponseEntityProcessVersionResponse, ResponseEntityListProcessVersionResponse } from './model/index';

/**
 * 保存
 * import { postProcessVersion } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export async function postProcessVersion(data: ProcessVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-version`,
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
 * import { deleteProcessVersion } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export interface deleteProcessVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessVersion(params: deleteProcessVersionQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-version`,
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
 * 激活版本
 * import { postProcessVersionActivateById } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export interface postProcessVersionActivateByIdPathInterface {
  id: string; // id
}
export async function postProcessVersionActivateById(path: postProcessVersionActivateByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-version/activate/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存部署流程
 * import { putProcessVersionDeploy } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export async function putProcessVersionDeploy(data: DeployRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-version/deploy`,
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
 * import { getProcessVersionInfo } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export interface getProcessVersionInfoQueryInterface {
  id: string; // id
  includeXml: boolean; // includeXml
}
export async function getProcessVersionInfo(params: getProcessVersionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityProcessVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-version/info`,
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
 * import { getProcessVersionList } from "/@/apis/gct-apaas/ProcessVersionController"
 */
export interface getProcessVersionListQueryInterface {
  processId: string; // processId
}
export async function getProcessVersionList(params: getProcessVersionListQueryInterface = {}, config = {}): Promise<ResponseEntityListProcessVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-version/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}