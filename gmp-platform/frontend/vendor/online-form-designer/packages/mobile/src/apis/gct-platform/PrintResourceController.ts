import request from '@mobile/utils/request';
import type { PrintResourceRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntityPrintResourceCount, ResponseEntityPrintResourceResponse, ResponseEntityListPrintResourceResponse, ResponseEntityListPrintListDto, PrintLogDto, PrintResourceRemarkRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPrintResource } from "/@/apis/gct-platform/PrintResourceController"
 */
export async function postPrintResource(data: PrintResourceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePrintResource } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface deletePrintResourceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePrintResource(params: deletePrintResourceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 查询打印机状态
 * import { getPrintResourceGetIpAddressStatus } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface getPrintResourceGetIpAddressStatusQueryInterface {
  address: string; // address
  type: string; // type
}
export async function getPrintResourceGetIpAddressStatus(params: getPrintResourceGetIpAddressStatusQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/getIpAddressStatus`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取打印服务和网络打印机的数量
 * import { getPrintResourceGetPrintCount } from "/@/apis/gct-platform/PrintResourceController"
 */
export async function getPrintResourceGetPrintCount(config:AxiosRequestConfig = {}): Promise<ResponseEntityPrintResourceCount['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/getPrintCount`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getPrintResourceInfo } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface getPrintResourceInfoQueryInterface {
  id: string; // id
}
export async function getPrintResourceInfo(params: getPrintResourceInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPrintResourceResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPrintResourceList } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface getPrintResourceListQueryInterface {
  queryState: number; // queryState
  type: string; // type
}
export async function getPrintResourceList(params: getPrintResourceListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintResourceResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据mac地址查询打印机列表
 * import { getPrintResourceListByMacAddress } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface getPrintResourceListByMacAddressQueryInterface {
  macAddress?: string; // macAddress
}
export async function getPrintResourceListByMacAddress(params: getPrintResourceListByMacAddressQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintListDto['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/listByMacAddress`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * printTest
 * import { postPrintResourcePrintTest } from "/@/apis/gct-platform/PrintResourceController"
 */
export async function postPrintResourcePrintTest(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/printTest`,
      method: 'post',
      ...config,
    },
  );
}

/**
 * 给打印机推送打印消息
 * import { postPrintResourceSendPrintData } from "/@/apis/gct-platform/PrintResourceController"
 */
export async function postPrintResourceSendPrintData(data: PrintLogDto, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/sendPrintData`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改备注
 * import { putPrintResourceUpdateRemarkById } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface putPrintResourceUpdateRemarkByIdPathInterface {
  id: string; // id
}
export async function putPrintResourceUpdateRemarkById(path: putPrintResourceUpdateRemarkByIdPathInterface, data: PrintResourceRemarkRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/updateRemark/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPrintResourceById } from "/@/apis/gct-platform/PrintResourceController"
 */
export interface putPrintResourceByIdPathInterface {
  id: string; // id
}
export async function putPrintResourceById(path: putPrintResourceByIdPathInterface, data: PrintResourceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/print-resource/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}