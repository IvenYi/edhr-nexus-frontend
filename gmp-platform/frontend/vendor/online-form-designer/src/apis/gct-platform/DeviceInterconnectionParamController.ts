import { defHttp } from '@/utils/http/axios';
import { DeviceInterconnectionParamRequest, ResponseEntitystring, ResponseEntity, ResponseEntityDeviceInterconnectionParamResponse, ResponseEntityListDeviceInterconnectionParamResponse, ResponseEntityPageBaseDeviceInterconnectionParamResponse } from './model/index';

/**
 * 新建
 * import { postDeviceInterconnectionParam } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export async function postDeviceInterconnectionParam(data: DeviceInterconnectionParamRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/device-interconnection-param`,
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
 * import { deleteDeviceInterconnectionParam } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export interface deleteDeviceInterconnectionParamQueryInterface {
  id: string; // id
}
export async function deleteDeviceInterconnectionParam(params: deleteDeviceInterconnectionParamQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/device-interconnection-param`,
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
 * 导出
 * import { postDeviceInterconnectionParamExport } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export async function postDeviceInterconnectionParamExport(data: string[], config = {}): Promise<ResponseEntity['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/device-interconnection-param/export`,
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
 * import { postDeviceInterconnectionParamImport } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export async function postDeviceInterconnectionParamImport(data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/device-interconnection-param/import`,
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
 * import { getDeviceInterconnectionParamInfo } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export interface getDeviceInterconnectionParamInfoQueryInterface {
  id: string; // id
}
export async function getDeviceInterconnectionParamInfo(params: getDeviceInterconnectionParamInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDeviceInterconnectionParamResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-interconnection-param/info`,
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
 * import { getDeviceInterconnectionParamList } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export async function getDeviceInterconnectionParamList(config = {}): Promise<ResponseEntityListDeviceInterconnectionParamResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-interconnection-param/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getDeviceInterconnectionParamPageList(params: getDeviceInterconnectionParamPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDeviceInterconnectionParamResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-interconnection-param/page/list`,
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
 * import { putDeviceInterconnectionParamById } from "/@/apis/gct-platform/DeviceInterconnectionParamController"
 */
export interface putDeviceInterconnectionParamByIdPathInterface {
  id: string; // id
}
export async function putDeviceInterconnectionParamById(path: putDeviceInterconnectionParamByIdPathInterface, data: DeviceInterconnectionParamRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/device-interconnection-param/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}