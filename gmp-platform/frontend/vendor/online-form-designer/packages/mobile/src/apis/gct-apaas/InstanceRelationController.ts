import request from '@mobile/utils/request';
import type { InstanceRelationRequest, ResponseEntitystring, ResponseEntityInstanceRelationResponse, ResponseEntityListInstanceRelationResponse, ResponseEntityPageBaseInstanceRelationResponse, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 绑定表单任务实例
 * import { postInstanceRelationBind } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export async function postInstanceRelationBind(data: InstanceRelationRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/instance-relation/bind`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getInstanceRelationInfo } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export interface getInstanceRelationInfoQueryInterface {
  id: string; // id
}
export async function getInstanceRelationInfo(params: getInstanceRelationInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityInstanceRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/instance-relation/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getInstanceRelationList } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export async function getInstanceRelationList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListInstanceRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/instance-relation/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getInstanceRelationPageList } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export interface getInstanceRelationPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getInstanceRelationPageList(params: getInstanceRelationPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseInstanceRelationResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/instance-relation/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 解绑表单任务实例
 * import { deleteInstanceRelationUnbind } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export interface deleteInstanceRelationUnbindQueryInterface {
  instId: string; // 关联实例id
  materialNo: string; // 批次号
}
export async function deleteInstanceRelationUnbind(params: deleteInstanceRelationUnbindQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/instance-relation/unbind`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 修改标题-附录
 * import { putInstanceRelationUpdateTitle } from "/@/apis/gct-apaas/InstanceRelationController"
 */
export interface putInstanceRelationUpdateTitleQueryInterface {
  materialNo: string; // materialNo
  ofInstId: string; // ofInstId
  title: string; // title
}
export async function putInstanceRelationUpdateTitle(params: putInstanceRelationUpdateTitleQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/instance-relation/updateTitle`,
      method: 'put',
      params,
      ...config,
    },
  );
}