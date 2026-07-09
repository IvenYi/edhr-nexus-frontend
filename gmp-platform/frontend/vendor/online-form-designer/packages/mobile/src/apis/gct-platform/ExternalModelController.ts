import request from '@mobile/utils/request';
import type { ResponseEntityModelDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取LLM
 * import { getModelInfo } from "/@/apis/gct-platform/ExternalModelController"
 */
export interface getModelInfoQueryInterface {
  modelName: string; // 模型名称
  providerId: string; // 服务提供商
}
export async function getModelInfo(params: getModelInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/model/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}