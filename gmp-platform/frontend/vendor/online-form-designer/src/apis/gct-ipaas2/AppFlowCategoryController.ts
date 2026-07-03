import { defHttp } from '@/utils/http/axios';
import { FlowCreateWithCategoryReq, ResponseEntitystring } from './model/index';

/**
 * 新建数据流
 * import { postCategoryFlow } from "/@/apis/gct-ipaas2/AppFlowCategoryController"
 */
export async function postCategoryFlow(data: FlowCreateWithCategoryReq, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/category/flow`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}