import request from '@mobile/utils/request';
import type { ResponseEntityPageBaseLoginLogResponse, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

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
export async function getLoginLogPageList(params: getLoginLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseLoginLogResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/login-log/page/list`,
      method: 'get',
      params,
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
export async function getLoginLogTenantLog(params: getLoginLogTenantLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/login-log/tenant/log`,
      method: 'get',
      params,
      ...config,
    },
  );
}