import request from '@mobile/utils/request';
import type { DeviceInterconnectionRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityDeviceInterconnectionResponse, ResponseEntityListDeviceInterconnectionResponse, ResponseEntityPageBaseDeviceInterconnectionResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 新建
 * import { postDeviceInterconnection } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export async function postDeviceInterconnection(data: DeviceInterconnectionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDeviceInterconnection } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export interface deleteDeviceInterconnectionQueryInterface {
  id: string; // 删除的id
}
export async function deleteDeviceInterconnection(params: deleteDeviceInterconnectionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 获取设备数据（仅仅支持连接流）
 * import { getDeviceInterconnectionData } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export interface getDeviceInterconnectionDataQueryInterface {
  deviceId: string; // 设备的id
}
export async function getDeviceInterconnectionData(params: getDeviceInterconnectionDataQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection/data`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 批量导出
 * import { postDeviceInterconnectionExport } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export async function postDeviceInterconnectionExport(data: undefined[], config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection/export`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 导入
 * import { postDeviceInterconnectionImport } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export async function postDeviceInterconnectionImport(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection/import`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDeviceInterconnectionInfo } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export interface getDeviceInterconnectionInfoQueryInterface {
  id: string; // id
}
export async function getDeviceInterconnectionInfo(params: getDeviceInterconnectionInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDeviceInterconnectionResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDeviceInterconnectionList } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export async function getDeviceInterconnectionList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListDeviceInterconnectionResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDeviceInterconnectionPageList } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export interface getDeviceInterconnectionPageListQueryInterface {
  keyword?: string; // 设备编号或名称
  pageNo: number; // 页码
  pageSize: number; // 每页数据条数
}
export async function getDeviceInterconnectionPageList(params: getDeviceInterconnectionPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDeviceInterconnectionResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 编辑
 * import { putDeviceInterconnectionById } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export interface putDeviceInterconnectionByIdPathInterface {
  id: string; // id
}
export async function putDeviceInterconnectionById(path: putDeviceInterconnectionByIdPathInterface, data: DeviceInterconnectionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/device-interconnection/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}