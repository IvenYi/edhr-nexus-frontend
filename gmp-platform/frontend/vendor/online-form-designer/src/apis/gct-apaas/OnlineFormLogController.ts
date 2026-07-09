import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListOnlineFormLogResponse } from './model/index';

/**
 * 列表
 * import { getOnlineFormLogList } from "/@/apis/gct-apaas/OnlineFormLogController"
 */
export interface getOnlineFormLogListQueryInterface {
  IgnoreBtnType?: string; // 需要忽略的按钮类型：以逗号分割：Form(变更-原后端定义之Change),Abandon(作废)
  instanceId?: string; // 在线表单实例id
  procDefType: string; // 流程类型: 电子表单审批 OF_APPROVE、文控审批 DOC_CONTROL_APPROVE
  tmplId: string; // 在线表单模板id/文控文件模板id:baseId:id
}
export async function getOnlineFormLogList(params: getOnlineFormLogListQueryInterface = {}, config = {}): Promise<ResponseEntityListOnlineFormLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form-log/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}