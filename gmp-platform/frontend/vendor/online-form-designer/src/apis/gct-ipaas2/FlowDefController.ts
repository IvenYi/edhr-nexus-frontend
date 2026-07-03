import { defHttp } from '@/utils/http/axios';
import { FlowUpdateReq, ResponseEntitystring } from './model/index';

/**
 * 更新连接流信息
 * import { putFlowByFuuid } from "/@/apis/gct-ipaas2/FlowDefController"
 */
export interface putFlowByFuuidPathInterface {
  fuuid: string; // fuuid
}
export async function putFlowByFuuid(path: putFlowByFuuidPathInterface, data: FlowUpdateReq, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/flow/${path?.fuuid}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}