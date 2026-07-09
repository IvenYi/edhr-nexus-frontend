import request from '@mobile/utils/request';
import type { ResponseEntityDeviceParamRefResponse, ResponseEntityListDeviceParamRefResponse, ResponseEntityPageBaseDeviceParamRefResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 详情
 * import { getDeviceParamRefInfo } from "/@/apis/gct-platform/DeviceParamRefController"
 */
export interface getDeviceParamRefInfoQueryInterface {
  id: string; // id
}
export async function getDeviceParamRefInfo(params: getDeviceParamRefInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDeviceParamRefResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-param-ref/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDeviceParamRefList } from "/@/apis/gct-platform/DeviceParamRefController"
 */
export async function getDeviceParamRefList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListDeviceParamRefResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-param-ref/list`,
      method: 'get',
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
export async function getDeviceParamRefPageList(params: getDeviceParamRefPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDeviceParamRefResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/device-param-ref/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}