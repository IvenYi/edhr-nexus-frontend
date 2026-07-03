import { defHttp } from '@/utils/http/axios';
import { OpenapiGroupRequest, ResponseEntitystring } from './model/index';

/**
 * 保存
 * import { postOpenapiGroupExternal } from "/@/apis/gct-platform/ExternalOpenapiGroupController"
 */
export async function postOpenapiGroupExternal(data: OpenapiGroupRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/openapi-group`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 启用禁用
 * import { putOpenapiGroupEnabledExternal } from "/@/apis/gct-platform/ExternalOpenapiGroupController"
 */
export interface putOpenapiGroupEnabledExternalQueryInterface {
  appTag: string; // 应用标识
  state: number; // 状态
}
export async function putOpenapiGroupEnabledExternal(params: putOpenapiGroupEnabledExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/external/api/openapi-group/enabled`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 是否有开放api
 * import { putOpenapiGroupOpenedExternal } from "/@/apis/gct-platform/ExternalOpenapiGroupController"
 */
export interface putOpenapiGroupOpenedExternalQueryInterface {
  appTag: string; // 应用标识
  env: string; // 环境
  state: number; // 状态
}
export async function putOpenapiGroupOpenedExternal(params: putOpenapiGroupOpenedExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/external/api/openapi-group/opened`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}