import request from '@mobile/utils/request';
import type { OpenapiGroupRequest, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postOpenapiGroup } from "/@/apis/gct-platform/ExternalOpenapiGroupController"
 */
export async function postOpenapiGroup(data: OpenapiGroupRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/openapi-group`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 启用禁用
 * import { putOpenapiGroupEnabled } from "/@/apis/gct-platform/ExternalOpenapiGroupController"
 */
export interface putOpenapiGroupEnabledQueryInterface {
  appTag: string; // 应用标识
  state: number; // 状态
}
export async function putOpenapiGroupEnabled(params: putOpenapiGroupEnabledQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/openapi-group/enabled`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 是否有开放api
 * import { putOpenapiGroupOpened } from "/@/apis/gct-platform/ExternalOpenapiGroupController"
 */
export interface putOpenapiGroupOpenedQueryInterface {
  appTag: string; // 应用标识
  env: string; // 环境
  state: number; // 状态
}
export async function putOpenapiGroupOpened(params: putOpenapiGroupOpenedQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/openapi-group/opened`,
      method: 'put',
      params,
      ...config,
    },
  );
}