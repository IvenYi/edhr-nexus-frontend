import request from '@mobile/utils/request';
import type { DeviceInterconnectionParamRequest, ResponseEntitystring, ResponseEntity, ResponseEntityDeviceInterconnectionParamResponse, ResponseEntityListDeviceInterconnectionParamResponse, ResponseEntityPageBaseDeviceInterconnectionParamResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 新建
 * import { postDeviceInterconnectionParam } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export async function postDeviceInterconnectionParam(data: DeviceInterconnectionParamRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection-param`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDeviceInterconnectionParam } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export interface deleteDeviceInterconnectionParamQueryInterface {
  id: string; // id
}
export async function deleteDeviceInterconnectionParam(params: deleteDeviceInterconnectionParamQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection-param`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 导出
 * import { postDeviceInterconnectionParamExport } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export async function postDeviceInterconnectionParamExport(data: undefined[], config:AxiosRequestConfig = {}): Promise<ResponseEntity['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection-param/export`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 导入
 * import { postDeviceInterconnectionParamImport } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export async function postDeviceInterconnectionParamImport(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection-param/import`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDeviceInterconnectionParamInfo } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export interface getDeviceInterconnectionParamInfoQueryInterface {
  id: string; // id
}
export async function getDeviceInterconnectionParamInfo(params: getDeviceInterconnectionParamInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDeviceInterconnectionParamResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection-param/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDeviceInterconnectionParamList } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export async function getDeviceInterconnectionParamList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListDeviceInterconnectionParamResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection-param/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDeviceInterconnectionParamPageList } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export interface getDeviceInterconnectionParamPageListQueryInterface {
  keyword?: string; // 搜索关键字
  pageNo: number; // 页码
  pageSize: number; // 每页数据条数
}
export async function getDeviceInterconnectionParamPageList(params: getDeviceInterconnectionParamPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDeviceInterconnectionParamResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection-param/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 编辑
 * import { putDeviceInterconnectionParamById } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export interface putDeviceInterconnectionParamByIdPathInterface {
  id: string; // id
}
export async function putDeviceInterconnectionParamById(path: putDeviceInterconnectionParamByIdPathInterface, data: DeviceInterconnectionParamRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection-param/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}