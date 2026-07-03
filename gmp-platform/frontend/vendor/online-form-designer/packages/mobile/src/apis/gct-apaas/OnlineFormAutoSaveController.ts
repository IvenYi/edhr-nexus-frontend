import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 中断自动保存
 * import { postOnlineFormAutoSaveInterrupt } from "/@/apis/gct-apaas/OnlineFormAutoSaveController"
 */
export interface postOnlineFormAutoSaveInterruptQueryInterface {
  execute: number; // 是否执行保存 0/1
  ofInstId: string; // 实例id
}
export async function postOnlineFormAutoSaveInterrupt(params: postOnlineFormAutoSaveInterruptQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/auto-save/interrupt`,
      method: 'post',
      params,
      ...config,
    },
  );
}