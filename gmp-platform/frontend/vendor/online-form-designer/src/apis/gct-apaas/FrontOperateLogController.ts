import { defHttp } from '@/utils/http/axios';
import { ResponseEntityPageBaseFrontOperateLogResponse } from './model/index';

/**
 * 分页列表
 * import { getFrontOperateLogPageList } from "/@/apis/gct-apaas/FrontOperateLogController"
 */
export interface getFrontOperateLogPageListQueryInterface {
  bizModel?: string; // 模块(BIZ_SERVICE:业务模块 )
  endTime?: string; // 截止时间
  keyword?: string; // 内容
  operateType?: string; // 操作类型
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  startTime?: string; // 开始时间
  username?: string; // 操作人
}
export async function getFrontOperateLogPageList(params: getFrontOperateLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseFrontOperateLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/front-operate-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}