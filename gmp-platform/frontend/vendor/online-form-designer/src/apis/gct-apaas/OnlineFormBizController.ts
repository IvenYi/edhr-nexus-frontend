import { defHttp } from '@/utils/http/axios';
import { OnlineFormBizRequest, ResponseEntityobject } from './model/index';

/**
 * 业务服务汇总-支持SQL视图模型、自定义模型、基础模型、视图模型
 * import { postOnlineFormBizBizServiceSummary } from "/@/apis/gct-apaas/OnlineFormBizController"
 */
export async function postOnlineFormBizBizServiceSummary(data: OnlineFormBizRequest, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form/biz/bizServiceSummary`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}