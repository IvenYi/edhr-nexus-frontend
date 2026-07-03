import request from '@mobile/utils/request';
import type { ControlConfigRequest, ResponseEntitystring, ResponseEntityListDocControlCategoryCompleteVO, ResponseEntityControlConfigResponse, ResponseEntityListControlConfigResponse, ResponseEntityPageBaseControlConfigResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存或更新
 * import { postControlConfig } from "/@/apis/gct-apaas/ControlConfigController"
 */
export async function postControlConfig(data: ControlConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/control-config`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteControlConfig } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface deleteControlConfigQueryInterface {
  ids: string; // 删除的refId，多个按','分割
}
export async function deleteControlConfig(params: deleteControlConfigQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/control-config`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 在线表单/eDHR 受控配置分类树
 * import { getControlConfigCategoryList } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigCategoryListQueryInterface {
  moduleType: string; // moduleType
}
export async function getControlConfigCategoryList(params: getControlConfigCategoryListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocControlCategoryCompleteVO['data']> {
  return request(
    {
      url: `/gct-apaas/api/control-config/category/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getControlConfigInfo } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigInfoQueryInterface {
  id: string; // id
}
export async function getControlConfigInfo(params: getControlConfigInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityControlConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/control-config/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getControlConfigInfoByTypeByRefId } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigInfoByTypeByRefIdPathInterface {
  refId: string; // refId
  type: string; // type
}
export async function getControlConfigInfoByTypeByRefId(path: getControlConfigInfoByTypeByRefIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityControlConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/control-config/info/${path?.type}/${path?.refId}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 列表
 * import { getControlConfigList } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigListQueryInterface {
  type: string; // 单据分类:ONLINE_FORM_CATEGORY/eDHR分类:EDHR_CATEGORY/特殊表单:ONLINE_FORM_CFG/特殊eDHR:EDHR_CFG
}
export async function getControlConfigList(params: getControlConfigListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListControlConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/control-config/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 特殊分类配置分页列表
 * import { getControlConfigSpecialPageList } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigSpecialPageListQueryInterface {
  code?: string; // 表单编码
  name?: string; // 表单名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  type: string; // 特殊表单:ONLINE_FORM_CFG/特殊eDHR:EDHR_CFG
  version?: string; // 表单版本搜索
}
export async function getControlConfigSpecialPageList(params: getControlConfigSpecialPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseControlConfigResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/control-config/special/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putControlConfigById } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface putControlConfigByIdPathInterface {
  id: string; // id
}
export async function putControlConfigById(path: putControlConfigByIdPathInterface, data: ControlConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/control-config/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}