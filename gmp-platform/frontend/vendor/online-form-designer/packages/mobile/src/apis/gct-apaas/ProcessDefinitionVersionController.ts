import request from '@mobile/utils/request';
import type { ProcessDefinitionVersionRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityListProcessDefinitionVerListResponse, ResponseEntityProcessDefinitionVersionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 新增 - 返回流程版本定义的id
 * import { postProcessDefinitionVersion } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export async function postProcessDefinitionVersion(data: ProcessDefinitionVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition-version`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteProcessDefinitionVersion } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface deleteProcessDefinitionVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessDefinitionVersion(params: deleteProcessDefinitionVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition-version`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 复制
 * import { postProcessDefinitionVersionCopyById } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface postProcessDefinitionVersionCopyByIdPathInterface {
  id: string; // 流程版本id
}
export async function postProcessDefinitionVersionCopyById(path: postProcessDefinitionVersionCopyByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition-version/copy/${path?.id}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getProcessDefinitionVersionList } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface getProcessDefinitionVersionListQueryInterface {
  procDefId: string; // 流程定义id(表单版本id)
}
export async function getProcessDefinitionVersionList(params: getProcessDefinitionVersionListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessDefinitionVerListResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition-version/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询流程配置（兼容父版本确认默认子版本）
 * import { getProcessDefinitionVersionListByParentId } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface getProcessDefinitionVersionListByParentIdQueryInterface {
  procDefId: string; // 查询流程配置（兼容父版本确认默认子版本）
}
export async function getProcessDefinitionVersionListByParentId(params: getProcessDefinitionVersionListByParentIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListProcessDefinitionVerListResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition-version/listByParentId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 发布
 * import { postProcessDefinitionVersionPublishById } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface postProcessDefinitionVersionPublishByIdPathInterface {
  id: string; // 流程版本id
}
export async function postProcessDefinitionVersionPublishById(path: postProcessDefinitionVersionPublishByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition-version/publish/${path?.id}`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getProcessDefinitionVersionById } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface getProcessDefinitionVersionByIdPathInterface {
  id: string; // 流程版本id
}
export async function getProcessDefinitionVersionById(path: getProcessDefinitionVersionByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityProcessDefinitionVersionResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition-version/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 修改
 * import { putProcessDefinitionVersionById } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface putProcessDefinitionVersionByIdPathInterface {
  id: string; // 流程版本id
}
export async function putProcessDefinitionVersionById(path: putProcessDefinitionVersionByIdPathInterface, data: ProcessDefinitionVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/process-definition-version/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}