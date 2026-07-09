import { defHttp } from '@/utils/http/axios';
import { ResponseEntityDeviceParamRefResponse, ResponseEntityListDeviceParamRefResponse, ResponseEntityPageBaseDeviceParamRefResponse } from './model/index';

/**
 * 详情
 * import { getDeviceParamRefInfo } from "/@/apis/gct-platform/DeviceParamRefController"
 */
export interface getDeviceParamRefInfoQueryInterface {
  id: string; // id
}
export async function getDeviceParamRefInfo(params: getDeviceParamRefInfoQueryInterface = {}, config = {}): Promise<ResponseEntityDeviceParamRefResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-param-ref/info`,
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
 * import { getDeviceParamRefList } from "/@/apis/gct-platform/DeviceParamRefController"
 */
export async function getDeviceParamRefList(config = {}): Promise<ResponseEntityListDeviceParamRefResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-param-ref/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDeviceParamRefPageList } from "/@/apis/gct-platform/DeviceParamRefController"
 */
export interface getDeviceParamRefPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDeviceParamRefPageList(params: getDeviceParamRefPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDeviceParamRefResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/device-param-ref/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}