import { defHttp } from '@/utils/http/axios';
import { OpenapiAuthorization, ResponseEntitystring } from './model/index';

/**
 * openfeign修改授权接口
 * import { putOpenapiKeyGrantUpdateApiExternal } from "/@/apis/gct-platform/ExternalOpenapiKeyGrantController"
 */
export interface putOpenapiKeyGrantUpdateApiExternalQueryInterface {
  appTag: string; // 应用标识
  delete: boolean; // 是否删除
  env: string; // 环境
}
export async function putOpenapiKeyGrantUpdateApiExternal(data: OpenapiAuthorization[], params: putOpenapiKeyGrantUpdateApiExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/external/api/openapi-key-grant/updateApi`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}