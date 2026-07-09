import request from '@mobile/utils/request';
import type { ResponseEntitystring, AssistantRequest, Fluxstring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 调试
 * import { getScriptAssistantRag } from "/@/apis/gct-apaas/ScriptAssistantController"
 */
export async function getScriptAssistantRag(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-assistant/rag`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 前后端代码生成
 * import { postScriptAssistantScriptComplete } from "/@/apis/gct-apaas/ScriptAssistantController"
 */
export async function postScriptAssistantScriptComplete(data: AssistantRequest, config:AxiosRequestConfig = {}): Promise<Fluxstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/script-assistant/scriptComplete`,
      method: 'post',
      data,
      ...config,
    },
  );
}