import { defHttp } from '@/utils/http/axios';
import { ConnectorConfigRequest, ResponseEntityobject, ResponseEntityMapstringobject, RequestBizServiceConfig, ResponseEntityFlowDebugNodeLog } from './model/index';

/**
 * 测试连接
 * import { postAuthTestConnect } from "/@/apis/gct-ipaas2/AuthController"
 */
export async function postAuthTestConnect(data: ConnectorConfigRequest, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/auth/test/connect`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据连接配置id测试连接
 * import { getAuthTestConnectOnce } from "/@/apis/gct-ipaas2/AuthController"
 */
export interface getAuthTestConnectOnceQueryInterface {
  id: string; // 连接配置id
}
export async function getAuthTestConnectOnce(params: getAuthTestConnectOnceQueryInterface = {}, config = {}): Promise<ResponseEntityMapstringobject['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/auth/test/connect/once`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试请求业务服务
 * import { postAuthTestRequestService } from "/@/apis/gct-ipaas2/AuthController"
 */
export async function postAuthTestRequestService(data: RequestBizServiceConfig, config = {}): Promise<ResponseEntityFlowDebugNodeLog['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/auth/test/request/service`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}