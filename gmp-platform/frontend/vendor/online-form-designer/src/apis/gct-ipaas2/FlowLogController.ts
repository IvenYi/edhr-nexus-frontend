import { defHttp } from '@/utils/http/axios';
import { ResponseEntityPageBaseFlowLogResp, ResponseEntityListFlowNodeLogResp } from './model/index';

/**
 * 流程日志列表
 * import { getFlowLogPageSearch } from "/@/apis/gct-ipaas2/FlowLogController"
 */
export interface getFlowLogPageSearchQueryInterface {
  appId?: string; // 所属应用
  inputPayload?: string; // 输入报文-payload
  key?: string; // 连接流key
  name?: string; // 连接流名称
  outputPayload?: string; // 输出报文-payload
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  status?: number; // 调用结果
  triggerType?: string; // 调用方式
}
export async function getFlowLogPageSearch(params: getFlowLogPageSearchQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseFlowLogResp['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/log/page/search`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 节点日志列表
 * import { getFlowNodeLogByReqId } from "/@/apis/gct-ipaas2/FlowLogController"
 */
export interface getFlowNodeLogByReqIdPathInterface {
  reqId: string; // reqId
}
export async function getFlowNodeLogByReqId(path: getFlowNodeLogByReqIdPathInterface, config = {}): Promise<ResponseEntityListFlowNodeLogResp['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/flow/node/log/${path?.reqId}`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}