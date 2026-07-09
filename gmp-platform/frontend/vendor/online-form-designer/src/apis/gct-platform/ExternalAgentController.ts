import { defHttp } from '@/utils/http/axios';
import { ResponseEntityAgentDTO } from './model/index';

/**
 * 获取脚本智能体
 * import { getAgentScriptAgentExternal } from "/@/apis/gct-platform/ExternalAgentController"
 */
export interface getAgentScriptAgentExternalQueryInterface {
  usage: string; // 用途
}
export async function getAgentScriptAgentExternal(params: getAgentScriptAgentExternalQueryInterface = {}, config = {}): Promise<ResponseEntityAgentDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/agent/scriptAgent`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}