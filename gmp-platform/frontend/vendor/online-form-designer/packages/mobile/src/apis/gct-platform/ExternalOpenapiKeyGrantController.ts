import request from '@mobile/utils/request';
import type { OpenapiAuthorization, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * openfeign修改授权接口
 * import { putOpenapiKeyGrantUpdateApi } from "/@/apis/gct-platform/ExternalOpenapiKeyGrantController"
 */
export interface putOpenapiKeyGrantUpdateApiQueryInterface {
  appTag: string; // 应用标识
  delete: boolean; // 是否删除
  env: string; // 环境
}
export async function putOpenapiKeyGrantUpdateApi(data: OpenapiAuthorization[], params: putOpenapiKeyGrantUpdateApiQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/openapi-key-grant/updateApi`,
      method: 'put',
      params,
      data,
      ...config,
    },
  );
}