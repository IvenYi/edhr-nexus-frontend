import request from '@mobile/utils/request';
import type { CustomerComplaintRequest, ResponseEntitystring, ResponseEntityCustomerComplaintResponse, ResponseEntityListCustomerComplaintResponse, ResponseEntityPageBaseCustomerComplaintResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postCustomerComplaint } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export async function postCustomerComplaint(data: CustomerComplaintRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/customer-complaint`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteCustomerComplaint } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export interface deleteCustomerComplaintQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCustomerComplaint(params: deleteCustomerComplaintQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/customer-complaint`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getCustomerComplaintInfo } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export interface getCustomerComplaintInfoQueryInterface {
  id: string; // id
}
export async function getCustomerComplaintInfo(params: getCustomerComplaintInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityCustomerComplaintResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/customer-complaint/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getCustomerComplaintList } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export async function getCustomerComplaintList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListCustomerComplaintResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/customer-complaint/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getCustomerComplaintPageList } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export interface getCustomerComplaintPageListQueryInterface {
  batchNumber?: string; // batchNumber
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  productName?: string; // productName
  specificationModel?: string; // specificationModel
}
export async function getCustomerComplaintPageList(params: getCustomerComplaintPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseCustomerComplaintResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/customer-complaint/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 同步数据
 * import { getCustomerComplaintSync } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export async function getCustomerComplaintSync(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/customer-complaint/sync`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 更新飞书数据
 * import { getCustomerComplaintUpdateFeishu } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export interface getCustomerComplaintUpdateFeishuQueryInterface {
  recordId: string; // 更新地址
  url: string; // 更新地址
}
export async function getCustomerComplaintUpdateFeishu(params: getCustomerComplaintUpdateFeishuQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/customer-complaint/updateFeishu`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putCustomerComplaintById } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export interface putCustomerComplaintByIdPathInterface {
  id: string; // id
}
export async function putCustomerComplaintById(path: putCustomerComplaintByIdPathInterface, data: CustomerComplaintRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/customer-complaint/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}