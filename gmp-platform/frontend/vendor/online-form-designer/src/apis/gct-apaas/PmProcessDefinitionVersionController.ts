import { defHttp } from '@/utils/http/axios';
import { PmProcessDefinitionVersionRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityListProcessDefinitionVerListResponse, ProcessUserRequest, ResponseEntityProcessDefinitionVersionResponse } from './model/index';

/**
 * 新建版本
 * import { postPmProcessDefinitionVersion } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export async function postPmProcessDefinitionVersion(data: PmProcessDefinitionVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pm-process-definition-version`,
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
 * import { deletePmProcessDefinitionVersion } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface deletePmProcessDefinitionVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessDefinitionVersion(params: deletePmProcessDefinitionVersionQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/pm-process-definition-version`,
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
 * import { postPmProcessDefinitionVersionCopyById } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface postPmProcessDefinitionVersionCopyByIdPathInterface {
  id: string; // 流程版本id
}
export async function postPmProcessDefinitionVersionCopyById(path: postPmProcessDefinitionVersionCopyByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pm-process-definition-version/copy/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postPmProcessDefinitionVersionDeploy(params: postPmProcessDefinitionVersionDeployQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pm-process-definition-version/deploy`,
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
 * import { getPmProcessDefinitionVersionList } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface getPmProcessDefinitionVersionListQueryInterface {
  procDefId: string; // 流程定义id(表单版本id)
}
export async function getPmProcessDefinitionVersionList(params: getPmProcessDefinitionVersionListQueryInterface = {}, config = {}): Promise<ResponseEntityListProcessDefinitionVerListResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pm-process-definition-version/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postPmProcessDefinitionVersionSave } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export async function postPmProcessDefinitionVersionSave(data: PmProcessDefinitionVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pm-process-definition-version/save`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存并发布
 * import { postPmProcessDefinitionVersionSaveAndDeploy } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export async function postPmProcessDefinitionVersionSaveAndDeploy(data: PmProcessDefinitionVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pm-process-definition-version/saveAndDeploy`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存审批人和消息接收人
 * import { postPmProcessDefinitionVersionUpdateProcessUser } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export async function postPmProcessDefinitionVersionUpdateProcessUser(data: ProcessUserRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pm-process-definition-version/updateProcessUser`,
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
 * import { getPmProcessDefinitionVersionById } from "/@/apis/gct-apaas/PmProcessDefinitionVersionController"
 */
export interface getPmProcessDefinitionVersionByIdPathInterface {
  id: string; // 流程版本id
}
export async function getPmProcessDefinitionVersionById(path: getPmProcessDefinitionVersionByIdPathInterface, config = {}): Promise<ResponseEntityProcessDefinitionVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pm-process-definition-version/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}