import request from '@mobile/utils/request';
import type { SysConfigRequest, ResponseEntitystring, ResponseEntitySysConfigResponse, ResponseEntityListSysConfigResponse, ResponseEntityPageBaseSysConfigResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postSysConfig } from "/@/apis/gct-apaas/SysConfigController"
 */
export async function postSysConfig(data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sys-config`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteSysConfig } from "/@/apis/gct-apaas/SysConfigController"
 */
export interface deleteSysConfigQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSysConfig(params: deleteSysConfigQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sys-config`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getSysConfigInfo } from "/@/apis/gct-apaas/SysConfigController"
 */
export interface getSysConfigInfoQueryInterface {
  key: string; // key
}
export async function getSysConfigInfo(params: getSysConfigInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sys-config/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getSysConfigList } from "/@/apis/gct-apaas/SysConfigController"
 */
export async function getSysConfigList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSysConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sys-config/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getSysConfigPageList } from "/@/apis/gct-apaas/SysConfigController"
 */
export interface getSysConfigPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getSysConfigPageList(params: getSysConfigPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseSysConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/sys-config/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putSysConfigById } from "/@/apis/gct-apaas/SysConfigController"
 */
export interface putSysConfigByIdPathInterface {
  id: string; // id
}
export async function putSysConfigById(path: putSysConfigByIdPathInterface, data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/sys-config/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}