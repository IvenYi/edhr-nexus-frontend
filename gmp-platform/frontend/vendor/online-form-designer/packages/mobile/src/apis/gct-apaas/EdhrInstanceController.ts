import request from '@mobile/utils/request';
import type { EdhrInstanceRequest, ResponseEntitystring, ResponseEntityEdhrInstanceResponse, ResponseEntityPageBaseMaterialNo4TaskResponse, ResponseEntityPageBaseEdhrInstanceResponse, EdhrInstanceQueryRequest, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 创建实例保存
 * import { postEdhrInstance } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export async function postEdhrInstance(data: EdhrInstanceRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteEdhrInstance } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export interface deleteEdhrInstanceQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEdhrInstance(params: deleteEdhrInstanceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 根据materialNo查询edhr实例
 * import { getEdhrInstanceFindByMaterialNo } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export interface getEdhrInstanceFindByMaterialNoQueryInterface {
  materialNo: string; // materialNo
}
export async function getEdhrInstanceFindByMaterialNo(params: getEdhrInstanceFindByMaterialNoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance/findByMaterialNo`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询所有批次号
 * import { getEdhrInstanceFindMaterialNo } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export interface getEdhrInstanceFindMaterialNoQueryInterface {
  ignoreArchived?: boolean; // 是否忽略封存状态
  materialNo?: string; // 批次号
  module?: string; // 模块类型
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}
export async function getEdhrInstanceFindMaterialNo(params: getEdhrInstanceFindMaterialNoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseMaterialNo4TaskResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance/findMaterialNo`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getEdhrInstanceInfo } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export interface getEdhrInstanceInfoQueryInterface {
  id: string; // id
}
export async function getEdhrInstanceInfo(params: getEdhrInstanceInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEdhrInstancePageList } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export interface getEdhrInstancePageListQueryInterface {
  createUserId?: string; // 创建人id
  device?: string; // 设备
  endTime?: string; // 创建时间-结束
  instanceStatus?: string; // edhr状态
  materialNo?: string; // 记录标识
  materialNos?: array; // 批次/SN数组
  materialStatus?: string; // 记录类型(NO或SN)
  mfgOrderId?: string; // 工单id
  modifyUserId?: string; // 更新人id
  module?: string; // 模块类型
  operator?: string; // 操作人
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  productId?: string; // 产品ID
  serialNo?: string; // 流水号
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 创建时间-开始
}
export async function getEdhrInstancePageList(params: getEdhrInstancePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEdhrInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postEdhrInstancePageListGroup } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export async function postEdhrInstancePageListGroup(data: EdhrInstanceQueryRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEdhrInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance/page/list/group`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 反向追溯分页查询
 * import { getEdhrInstanceReversePageList } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export interface getEdhrInstanceReversePageListQueryInterface {
  device?: string; // 设备
  endTraceDate?: string; // 日期结束
  materialNo?: string; // 物料编号
  mfgOrderId?: string; // 工单id
  module?: string; // 模块类型
  operator?: string; // 操作人
  operatorId?: string; // 操作人id
  orderNo?: string; // 订单号
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  product?: string; // 产品
  recordNo?: string; // 记录单号
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTraceDate?: string; // 日期开始
}
export async function getEdhrInstanceReversePageList(params: getEdhrInstanceReversePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEdhrInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance/reverse/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据批次号查询
 * import { getEdhrInstanceRunningPage } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export interface getEdhrInstanceRunningPageQueryInterface {
  ignoreArchived?: boolean; // 是否忽略封存状态
  materialNo?: string; // 批次号
  module?: string; // 模块类型
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
}
export async function getEdhrInstanceRunningPage(params: getEdhrInstanceRunningPageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseEdhrInstanceResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance/running/page`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改为归档状态
 * import { putEdhrInstanceUpdateInstanceStatusById4ArchivedById } from "/@/apis/gct-apaas/EdhrInstanceController"
 */
export interface putEdhrInstanceUpdateInstanceStatusById4ArchivedByIdPathInterface {
  id: string; // id
}
export async function putEdhrInstanceUpdateInstanceStatusById4ArchivedById(path: putEdhrInstanceUpdateInstanceStatusById4ArchivedByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-instance/updateInstanceStatusById4Archived/${path?.id}`,
      method: 'put',
      ...config,
    },
  );
}