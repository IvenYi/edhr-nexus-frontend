import { defHttp } from '@/utils/http/axios';
import { ResponseEntityModelDTO } from './model/index';

/**
 * 获取LLM
 * import { getModelInfoExternal } from "/@/apis/gct-platform/ExternalModelController"
 */
export interface getModelInfoExternalQueryInterface {
  modelName: string; // 模型名称
  providerId: string; // 服务提供商
}
export async function getModelInfoExternal(params: getModelInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityModelDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/model/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}