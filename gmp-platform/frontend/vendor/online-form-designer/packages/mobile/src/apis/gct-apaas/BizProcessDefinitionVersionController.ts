import request from '@mobile/utils/request';
import type { PmProcessDefinitionVersionRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityListProcessDefinitionVerListResponse, ResponseEntityProcessDefinitionVersionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 新建版本
 * import { postBizProcessDefinitionVersion } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export async function postBizProcessDefinitionVersion(data: PmProcessDefinitionVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition-version`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteBizProcessDefinitionVersion } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface deleteBizProcessDefinitionVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBizProcessDefinitionVersion(params: deleteBizProcessDefinitionVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition-version`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 复制
 * import { postBizProcessDefinitionVersionCopyById } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface postBizProcessDefinitionVersionCopyByIdPathInterface {
  id: string; // 流程版本id
}
export async function postBizProcessDefinitionVersionCopyById(path: postBizProcessDefinitionVersionCopyByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition-version/copy/${path?.id}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 发布
 * import { postBizProcessDefinitionVersionDeploy } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface postBizProcessDefinitionVersionDeployQueryInterface {
  procVerId?: string; // procVerId
}
export async function postBizProcessDefinitionVersionDeploy(params: postBizProcessDefinitionVersionDeployQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition-version/deploy`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getBizProcessDefinitionVersionList } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface getBizProcessDefinitionVersionListQueryInterface {
  procDefId: string; // 流程定义id(表单版本id)
}
export async function getBizProcessDefinitionVersionList(params: getBizProcessDefinitionVersionListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessDefinitionVerListResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition-version/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postBizProcessDefinitionVersionSave } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export async function postBizProcessDefinitionVersionSave(data: PmProcessDefinitionVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition-version/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存并发布
 * import { postBizProcessDefinitionVersionSaveAndDeploy } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export async function postBizProcessDefinitionVersionSaveAndDeploy(data: PmProcessDefinitionVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition-version/saveAndDeploy`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getBizProcessDefinitionVersionById } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface getBizProcessDefinitionVersionByIdPathInterface {
  id: string; // 流程版本id
}
export async function getBizProcessDefinitionVersionById(path: getBizProcessDefinitionVersionByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessDefinitionVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/biz-process-definition-version/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}