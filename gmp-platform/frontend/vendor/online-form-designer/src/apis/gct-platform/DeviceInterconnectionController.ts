import { defHttp } from '@/utils/http/axios';
import { DeviceInterconnectionRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityDeviceInterconnectionResponse, ResponseEntityListDeviceInterconnectionResponse, ResponseEntityPageBaseDeviceInterconnectionResponse } from './model/index';

/**
 * 新建
 * import { postDeviceInterconnection } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export async function postDeviceInterconnection(data: DeviceInterconnectionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/device-interconnection`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function deleteDeviceInterconnection(params: deleteDeviceInterconnectionQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/device-interconnection`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDeviceInterconnectionData(params: getDeviceInterconnectionDataQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-interconnection/data`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量导出
 * import { postDeviceInterconnectionExport } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export async function postDeviceInterconnectionExport(data: string[], config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/api/device-interconnection/export`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 导入
 * import { postDeviceInterconnectionImport } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export async function postDeviceInterconnectionImport(data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/device-interconnection/import`,
      data,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDeviceInterconnectionInfo(params: getDeviceInterconnectionInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDeviceInterconnectionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-interconnection/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDeviceInterconnectionList } from "/@/apis/gct-platform/DeviceInterconnectionController"
 */
export async function getDeviceInterconnectionList(config = {}): Promise<ResponseEntityListDeviceInterconnectionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-interconnection/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDeviceInterconnectionPageList(params: getDeviceInterconnectionPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDeviceInterconnectionResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-interconnection/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putDeviceInterconnectionById(path: putDeviceInterconnectionByIdPathInterface, data: DeviceInterconnectionRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/device-interconnection/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}