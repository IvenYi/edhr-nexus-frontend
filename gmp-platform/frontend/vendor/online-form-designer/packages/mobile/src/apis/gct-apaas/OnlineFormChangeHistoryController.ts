import request from '@mobile/utils/request';
import type { ResponseEntityListOnlineFormChangeHistoryResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 变更历史列表
 * import { getOnlineFormChangeHistoryList } from "/@/apis/gct-apaas/OnlineFormChangeHistoryController"
 */
export interface getOnlineFormChangeHistoryListQueryInterface {
  cellLocation?: string; // 单元格坐标
  instanceId: string; // 在线表单实例ID
  tmplId: string; // 在线表单模板ID
}
export async function getOnlineFormChangeHistoryList(params: getOnlineFormChangeHistoryListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormChangeHistoryResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-change-history/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}