import request from '@mobile/utils/request';
import type { WorkbenchComponentRelationRequest, ResponseEntitystring, WorkbenchComponentRelationDragRequest, ResponseEntityWorkbenchComponentRelationResponse, ResponseEntityListWorkbenchComponentRelationResponse, ResponseEntityPageBaseWorkbenchComponentRelationResponse, WorkbenchComponentRelationBatchRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postWorkbenchComponentRelation } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export async function postWorkbenchComponentRelation(data: WorkbenchComponentRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteWorkbenchComponentRelation } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface deleteWorkbenchComponentRelationQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteWorkbenchComponentRelation(params: deleteWorkbenchComponentRelationQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽
 * import { postWorkbenchComponentRelationDrag } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export async function postWorkbenchComponentRelationDrag(data: WorkbenchComponentRelationDragRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation/drag`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getWorkbenchComponentRelationInfo } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface getWorkbenchComponentRelationInfoQueryInterface {
  id: string; // id
}
export async function getWorkbenchComponentRelationInfo(params: getWorkbenchComponentRelationInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityWorkbenchComponentRelationResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getWorkbenchComponentRelationList } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface getWorkbenchComponentRelationListQueryInterface {
  enabled: boolean; // enabled
}
export async function getWorkbenchComponentRelationList(params: getWorkbenchComponentRelationListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListWorkbenchComponentRelationResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getWorkbenchComponentRelationPageList } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface getWorkbenchComponentRelationPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getWorkbenchComponentRelationPageList(params: getWorkbenchComponentRelationPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseWorkbenchComponentRelationResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改位置信息
 * import { putWorkbenchComponentRelationUpdatePositionJson } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export async function putWorkbenchComponentRelationUpdatePositionJson(data: WorkbenchComponentRelationBatchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation/updatePositionJson`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 开启&关闭
 * import { putWorkbenchComponentRelationWorkbenchComponentActiveById } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface putWorkbenchComponentRelationWorkbenchComponentActiveByIdPathInterface {
  id: string; // id
}
export interface putWorkbenchComponentRelationWorkbenchComponentActiveByIdQueryInterface {
  enabled: number; // enabled
}
export async function putWorkbenchComponentRelationWorkbenchComponentActiveById(path: putWorkbenchComponentRelationWorkbenchComponentActiveByIdPathInterface, params: putWorkbenchComponentRelationWorkbenchComponentActiveByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation/workbenchComponentActive/${path?.id}`,
      method: 'put',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putWorkbenchComponentRelationById } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface putWorkbenchComponentRelationByIdPathInterface {
  id: string; // id
}
export async function putWorkbenchComponentRelationById(path: putWorkbenchComponentRelationByIdPathInterface, data: WorkbenchComponentRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/workbench-component-relation/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}