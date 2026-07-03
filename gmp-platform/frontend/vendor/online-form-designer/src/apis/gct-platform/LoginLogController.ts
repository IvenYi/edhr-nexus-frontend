import { defHttp } from '@/utils/http/axios';
import { ResponseEntityPageBaseLoginLogResponse, ResponseEntitystring } from './model/index';

/**
 * 登录足迹分页列表
 * import { getLoginLogPageList } from "/@/apis/gct-platform/LoginLogController"
 */
export interface getLoginLogPageListQueryInterface {
  endTime?: string; // 截止时间
  ip?: string; // IP地址
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  sourceEnum?: string; // 客户端
  startTime?: string; // 开始时间
}
export async function getLoginLogPageList(params: getLoginLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseLoginLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/login-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 最近登录租户
 * import { getLoginLogTenantLog } from "/@/apis/gct-platform/LoginLogController"
 */
export interface getLoginLogTenantLogQueryInterface {
  tenantId: string; // 租户ID
}
export async function getLoginLogTenantLog(params: getLoginLogTenantLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/login-log/tenant/log`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}