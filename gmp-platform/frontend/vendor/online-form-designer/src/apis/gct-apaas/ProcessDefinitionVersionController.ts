import { defHttp } from '@/utils/http/axios';
import { ProcessDefinitionVersionRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityListProcessDefinitionVerListResponse, ResponseEntityProcessDefinitionVersionResponse } from './model/index';

/**
 * 新增 - 返回流程版本定义的id
 * import { postProcessDefinitionVersion } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export async function postProcessDefinitionVersion(data: ProcessDefinitionVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-definition-version`,
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
 * import { deleteProcessDefinitionVersion } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface deleteProcessDefinitionVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteProcessDefinitionVersion(params: deleteProcessDefinitionVersionQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/process-definition-version`,
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
 * 复制
 * import { postProcessDefinitionVersionCopyById } from "/@/apis/gct-apaas/ProcessDefinitionVersionController"
 */
export interface postProcessDefinitionVersionCopyByIdPathInterface {
  id: string; // 流程版本id
}
export async function postProcessDefinitionVersionCopyById(path: postProcessDefinitionVersionCopyByIdPathInterface, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-definition-version/copy/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessDefinitionVersionList(params: getProcessDefinitionVersionListQueryInterface = {}, config = {}): Promise<ResponseEntityListProcessDefinitionVerListResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-definition-version/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessDefinitionVersionListByParentId(params: getProcessDefinitionVersionListByParentIdQueryInterface = {}, config = {}): Promise<ResponseEntityListProcessDefinitionVerListResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-definition-version/listByParentId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postProcessDefinitionVersionPublishById(path: postProcessDefinitionVersionPublishByIdPathInterface, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/process-definition-version/publish/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getProcessDefinitionVersionById(path: getProcessDefinitionVersionByIdPathInterface, config = {}): Promise<ResponseEntityProcessDefinitionVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/process-definition-version/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putProcessDefinitionVersionById(path: putProcessDefinitionVersionByIdPathInterface, data: ProcessDefinitionVersionRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/process-definition-version/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}