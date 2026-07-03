import request from '@mobile/utils/request';
import type { PmProcessDefinitionVersionRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityListProcessDefinitionVerListResponse, ProcessUserRequest, ResponseEntityProcessDefinitionVersionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 新建版本
 * import { postPmProcessDefinitionVersion } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export async function postPmProcessDefinitionVersion(data: PmProcessDefinitionVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePmProcessDefinitionVersion } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface deletePmProcessDefinitionVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessDefinitionVersion(params: deletePmProcessDefinitionVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 复制
 * import { postPmProcessDefinitionVersionCopyById } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface postPmProcessDefinitionVersionCopyByIdPathInterface {
  id: string; // 流程版本id
}
export async function postPmProcessDefinitionVersionCopyById(path: postPmProcessDefinitionVersionCopyByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version/copy/${path?.id}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 发布
 * import { postPmProcessDefinitionVersionDeploy } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface postPmProcessDefinitionVersionDeployQueryInterface {
  procVerId?: string; // procVerId
}
export async function postPmProcessDefinitionVersionDeploy(params: postPmProcessDefinitionVersionDeployQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version/deploy`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPmProcessDefinitionVersionList } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface getPmProcessDefinitionVersionListQueryInterface {
  procDefId: string; // 流程定义id(表单版本id)
}
export async function getPmProcessDefinitionVersionList(params: getPmProcessDefinitionVersionListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessDefinitionVerListResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postPmProcessDefinitionVersionSave } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export async function postPmProcessDefinitionVersionSave(data: PmProcessDefinitionVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存并发布
 * import { postPmProcessDefinitionVersionSaveAndDeploy } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export async function postPmProcessDefinitionVersionSaveAndDeploy(data: PmProcessDefinitionVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version/saveAndDeploy`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存审批人和消息接收人
 * import { postPmProcessDefinitionVersionUpdateProcessUser } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export async function postPmProcessDefinitionVersionUpdateProcessUser(data: ProcessUserRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version/updateProcessUser`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getPmProcessDefinitionVersionById } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface getPmProcessDefinitionVersionByIdPathInterface {
  id: string; // 流程版本id
}
export async function getPmProcessDefinitionVersionById(path: getPmProcessDefinitionVersionByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessDefinitionVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/pm-process-definition-version/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}