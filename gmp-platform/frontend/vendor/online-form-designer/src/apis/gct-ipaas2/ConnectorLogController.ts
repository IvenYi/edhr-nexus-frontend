import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityConnectorLogResponse, ResponseEntityListConnectorLogResponse, ConnectorLogRequest, ResponseEntityPageBaseConnectorLogResponse } from './model/index';

/**
 * 清理测试连接日志
 * import { deleteConnectorLog } from "/@/apis/gct-ipaas2/ConnectorLogController"
 */
export async function deleteConnectorLog(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-ipaas/api/connector-log`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getConnectorLogInfo } from "/@/apis/gct-ipaas2/ConnectorLogController"
 */
export interface getConnectorLogInfoQueryInterface {
  id: string; // id
}
export async function getConnectorLogInfo(params: getConnectorLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityConnectorLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/connector-log/info`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getConnectorLogList } from "/@/apis/gct-ipaas2/ConnectorLogController"
 */
export async function getConnectorLogList(config = {}): Promise<ResponseEntityListConnectorLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/connector-log/list`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 连接日志分页列表
 * import { postConnectorLogPageList } from "/@/apis/gct-ipaas2/ConnectorLogController"
 */
export interface postConnectorLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function postConnectorLogPageList(data: ConnectorLogRequest, params: postConnectorLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseConnectorLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/connector-log/page/list`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}