import request from '@mobile/utils/request';
import type { ResponseEntityAgentDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取脚本智能体
 * import { getAgentScriptAgent } from "/@/apis/gct-platform/ExternalAgentController"
 */
export interface getAgentScriptAgentQueryInterface {
  usage: string; // 用途
}
export async function getAgentScriptAgent(params: getAgentScriptAgentQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAgentDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/agent/scriptAgent`,
      method: 'get',
      params,
      ...config,
    },
  );
}