import request from '@mobile/utils/request';
import type { WorkbenchComponentRequest, ResponseEntitystring, ResponseEntityWorkbenchComponentResponse, ResponseEntityListWorkbenchComponentResponse, ResponseEntityPageBaseWorkbenchComponentResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postWorkbenchComponent } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export async function postWorkbenchComponent(data: WorkbenchComponentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteWorkbenchComponent } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface deleteWorkbenchComponentQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteWorkbenchComponent(params: deleteWorkbenchComponentQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getWorkbenchComponentInfo } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface getWorkbenchComponentInfoQueryInterface {
  id: string; // id
}
export async function getWorkbenchComponentInfo(params: getWorkbenchComponentInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityWorkbenchComponentResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getWorkbenchComponentList } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface getWorkbenchComponentListQueryInterface {
  terminalType?: string; // ...
  type?: string; // ...
}
export async function getWorkbenchComponentList(params: getWorkbenchComponentListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListWorkbenchComponentResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getWorkbenchComponentPageList } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface getWorkbenchComponentPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getWorkbenchComponentPageList(params: getWorkbenchComponentPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseWorkbenchComponentResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putWorkbenchComponentById } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface putWorkbenchComponentByIdPathInterface {
  id: string; // id
}
export async function putWorkbenchComponentById(path: putWorkbenchComponentByIdPathInterface, data: WorkbenchComponentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}