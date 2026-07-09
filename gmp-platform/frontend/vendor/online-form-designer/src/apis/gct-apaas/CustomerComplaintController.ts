import { defHttp } from '@/utils/http/axios';
import { CustomerComplaintRequest, ResponseEntitystring, ResponseEntityCustomerComplaintResponse, ResponseEntityListCustomerComplaintResponse, ResponseEntityPageBaseCustomerComplaintResponse } from './model/index';

/**
 * 保存
 * import { postCustomerComplaint } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export async function postCustomerComplaint(data: CustomerComplaintRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/customer-complaint`,
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
 * import { deleteCustomerComplaint } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export interface deleteCustomerComplaintQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCustomerComplaint(params: deleteCustomerComplaintQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/customer-complaint`,
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
 * 详情
 * import { getCustomerComplaintInfo } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export interface getCustomerComplaintInfoQueryInterface {
  id: string; // id
}
export async function getCustomerComplaintInfo(params: getCustomerComplaintInfoQueryInterface = {}, config = {}): Promise<ResponseEntityCustomerComplaintResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/customer-complaint/info`,
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
 * import { getCustomerComplaintList } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export async function getCustomerComplaintList(config = {}): Promise<ResponseEntityListCustomerComplaintResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/customer-complaint/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCustomerComplaintPageList(params: getCustomerComplaintPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseCustomerComplaintResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/customer-complaint/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 同步数据
 * import { getCustomerComplaintSync } from "/@/apis/gct-apaas/CustomerComplaintController"
 */
export async function getCustomerComplaintSync(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/customer-complaint/sync`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCustomerComplaintUpdateFeishu(params: getCustomerComplaintUpdateFeishuQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/customer-complaint/updateFeishu`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putCustomerComplaintById(path: putCustomerComplaintByIdPathInterface, data: CustomerComplaintRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/customer-complaint/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}