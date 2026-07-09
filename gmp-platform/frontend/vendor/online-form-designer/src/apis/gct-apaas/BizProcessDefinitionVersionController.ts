import { defHttp } from '@/utils/http/axios';
import { PmProcessDefinitionVersionRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityListProcessDefinitionVerListResponse, ResponseEntityProcessDefinitionVersionResponse } from './model/index';

/**
 * 新建版本
 * import { postBizProcessDefinitionVersion } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export async function postBizProcessDefinitionVersion(data: PmProcessDefinitionVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-process-definition-version`,
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
 * import { deleteBizProcessDefinitionVersion } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface deleteBizProcessDefinitionVersionQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteBizProcessDefinitionVersion(params: deleteBizProcessDefinitionVersionQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/biz-process-definition-version`,
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
 * import { postBizProcessDefinitionVersionCopyById } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface postBizProcessDefinitionVersionCopyByIdPathInterface {
  id: string; // 流程版本id
}
export async function postBizProcessDefinitionVersionCopyById(path: postBizProcessDefinitionVersionCopyByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-process-definition-version/copy/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postBizProcessDefinitionVersionDeploy(params: postBizProcessDefinitionVersionDeployQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-process-definition-version/deploy`,
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
 * import { getBizProcessDefinitionVersionList } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface getBizProcessDefinitionVersionListQueryInterface {
  procDefId: string; // 流程定义id(表单版本id)
}
export async function getBizProcessDefinitionVersionList(params: getBizProcessDefinitionVersionListQueryInterface = {}, config = {}): Promise<ResponseEntityListProcessDefinitionVerListResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-process-definition-version/list`,
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
 * import { postBizProcessDefinitionVersionSave } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export async function postBizProcessDefinitionVersionSave(data: PmProcessDefinitionVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-process-definition-version/save`,
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
 * import { postBizProcessDefinitionVersionSaveAndDeploy } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export async function postBizProcessDefinitionVersionSaveAndDeploy(data: PmProcessDefinitionVersionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/biz-process-definition-version/saveAndDeploy`,
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
 * import { getBizProcessDefinitionVersionById } from "/@/apis/gct-apaas/BizProcessDefinitionVersionController"
 */
export interface getBizProcessDefinitionVersionByIdPathInterface {
  id: string; // 流程版本id
}
export async function getBizProcessDefinitionVersionById(path: getBizProcessDefinitionVersionByIdPathInterface, config = {}): Promise<ResponseEntityProcessDefinitionVersionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/biz-process-definition-version/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}