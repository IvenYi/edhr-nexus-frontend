import { defHttp } from '@/utils/http/axios';
import { ConnectorConfigRequest, ResponseEntitystring, ResponseEntityConnectorConfigResponse, ResponseEntityFlowAppResponse, ResponseEntityListAppConnectorResp, ResponseEntityPageBaseAppConnectorResp } from './model/index';

/**
 * 保存
 * import { postConnectorConfig } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export async function postConnectorConfig(data: ConnectorConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/connector-config`,
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
 * 删除
 * import { deleteConnectorConfig } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export interface deleteConnectorConfigQueryInterface {
  id: string; // 删除的id,多个逗号拼接
}
export async function deleteConnectorConfig(params: deleteConnectorConfigQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-ipaas/api/connector-config`,
      params,
    },
    {
      joinUserToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 根据应用ID查询鉴权配置详情
 * import { getConnectorConfigByAppid } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export interface getConnectorConfigByAppidQueryInterface {
  id: string; // id
}
export async function getConnectorConfigByAppid(params: getConnectorConfigByAppidQueryInterface = {}, config = {}): Promise<ResponseEntityConnectorConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/connector-config/by/appid`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量导出连接器
 * import { postConnectorConfigExport } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export async function postConnectorConfigExport(data: string[], config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/connector-config/export`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据连接器的id查询其关联之应用
 * import { getConnectorConfigFindAppByConnectorId } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export interface getConnectorConfigFindAppByConnectorIdQueryInterface {
  id: string; // id
}
export async function getConnectorConfigFindAppByConnectorId(params: getConnectorConfigFindAppByConnectorIdQueryInterface = {}, config = {}): Promise<ResponseEntityFlowAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/connector-config/findAppByConnectorId`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 导入连接器
 * import { postConnectorConfigImport } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export interface postConnectorConfigImportQueryInterface {
  categoryId: string; // 导入分类
}
export async function postConnectorConfigImport(data: any, params: postConnectorConfigImportQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-ipaas/api/connector-config/import`,
      params,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getConnectorConfigInfo } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export interface getConnectorConfigInfoQueryInterface {
  id: string; // id
}
export async function getConnectorConfigInfo(params: getConnectorConfigInfoQueryInterface = {}, config = {}): Promise<ResponseEntityConnectorConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/connector-config/info`,
      params,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 服务编排查询应用配置列表
 * import { getConnectorConfigList } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export async function getConnectorConfigList(config = {}): Promise<ResponseEntityListAppConnectorResp['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/connector-config/list`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getConnectorConfigPageList } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export interface getConnectorConfigPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getConnectorConfigPageList(params: getConnectorConfigPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppConnectorResp['data']> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/connector-config/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putConnectorConfigById } from "/@/apis/gct-ipaas2/ConnectorConfigController"
 */
export interface putConnectorConfigByIdPathInterface {
  id: string; // id
}
export async function putConnectorConfigById(path: putConnectorConfigByIdPathInterface, data: ConnectorConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-ipaas/api/connector-config/${path?.id}`,
      data,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}