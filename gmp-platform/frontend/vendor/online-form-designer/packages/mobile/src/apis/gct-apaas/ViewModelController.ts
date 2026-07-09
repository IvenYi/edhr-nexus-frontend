import request from '@mobile/utils/request';
import type { ViewModelRequest, ResponseEntitystring, ResponseEntityViewModelFieldResponse, ResponseEntityViewModelResponse, ResponseEntityListViewModelResponse, ResponseEntityPageBaseViewModelResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postViewModel } from "/@/apis/gct-apaas/ViewModelController"
 */
export async function postViewModel(data: ViewModelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteViewModel } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface deleteViewModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteViewModel(params: deleteViewModelQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 模型列详情
 * import { getViewModelFieldInfo } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface getViewModelFieldInfoQueryInterface {
  id: string; // id
}
export async function getViewModelFieldInfo(params: getViewModelFieldInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityViewModelFieldResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/field/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getViewModelInfo } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface getViewModelInfoQueryInterface {
  id: string; // id
}
export async function getViewModelInfo(params: getViewModelInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityViewModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getViewModelList } from "/@/apis/gct-apaas/ViewModelController"
 */
export async function getViewModelList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListViewModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getViewModelPageList } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface getViewModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getViewModelPageList(params: getViewModelPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseViewModelResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查看sql
 * import { getViewModelSql } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface getViewModelSqlQueryInterface {
  id: string; // id
}
export async function getViewModelSql(params: getViewModelSqlQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/sql`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 模型启用禁用支持消息
 * import { putViewModelSupportMessageByModelKeyByEnabled } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface putViewModelSupportMessageByModelKeyByEnabledPathInterface {
  enabled: number; // 状态(1:启用 ,0: 禁用)
  modelKey: string; // 模型key
}
export async function putViewModelSupportMessageByModelKeyByEnabled(path: putViewModelSupportMessageByModelKeyByEnabledPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/support-message/${path?.modelKey}/${path?.enabled}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 修改
 * import { putViewModelById } from "/@/apis/gct-apaas/ViewModelController"
 */
export interface putViewModelByIdPathInterface {
  id: string; // id
}
export async function putViewModelById(path: putViewModelByIdPathInterface, data: ViewModelRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/view-model/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}