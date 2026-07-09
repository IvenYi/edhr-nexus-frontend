import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 中断自动保存
 * import { postOnlineFormAutoSaveInterrupt } from "/@/apis/gct-apaas/OnlineFormAutoSaveController"
 */
export interface postOnlineFormAutoSaveInterruptQueryInterface {
  execute: number; // 是否执行保存 0/1
  ofInstId: string; // 实例id
}
export async function postOnlineFormAutoSaveInterrupt(params: postOnlineFormAutoSaveInterruptQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/auto-save/interrupt`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}