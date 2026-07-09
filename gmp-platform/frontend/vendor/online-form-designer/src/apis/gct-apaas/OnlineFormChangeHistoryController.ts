import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListOnlineFormChangeHistoryResponse } from './model/index';

/**
 * 变更历史列表
 * import { getOnlineFormChangeHistoryList } from "/@/apis/gct-apaas/OnlineFormChangeHistoryController"
 */
export interface getOnlineFormChangeHistoryListQueryInterface {
  cellLocation?: string; // 单元格坐标
  instanceId: string; // 在线表单实例ID
  tmplId: string; // 在线表单模板ID
}
export async function getOnlineFormChangeHistoryList(params: getOnlineFormChangeHistoryListQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormChangeHistoryResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-change-history/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}