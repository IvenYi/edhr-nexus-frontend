import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, AssistantRequest, Fluxstring } from './model/index';

/**
 * 调试
 * import { getScriptAssistantRag } from "/@/apis/gct-apaas/ScriptAssistantController"
 */
export async function getScriptAssistantRag(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/script-assistant/rag`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 前后端代码生成
 * import { postScriptAssistantScriptComplete } from "/@/apis/gct-apaas/ScriptAssistantController"
 */
export async function postScriptAssistantScriptComplete(data: AssistantRequest, config = {}): Promise<Fluxstring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/script-assistant/scriptComplete`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}