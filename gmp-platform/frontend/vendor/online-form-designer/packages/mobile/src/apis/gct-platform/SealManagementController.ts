import request from '@mobile/utils/request';
import type { SealManagementRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntitySealManagementResponse, ResponseEntityListSealManagementResponse, ResponseEntityPageBaseSealManagementResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postSealManagement } from "/@/apis/gct-platform/SealManagementController"
 */
export async function postSealManagement(data: SealManagementRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/seal-management`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteSealManagement } from "/@/apis/gct-platform/SealManagementController"
 */
export interface deleteSealManagementQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSealManagement(params: deleteSealManagementQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/seal-management`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 判断名称是否重复
 * import { getSealManagementCheckName } from "/@/apis/gct-platform/SealManagementController"
 */
export interface getSealManagementCheckNameQueryInterface {
  name: string; // 名称
}
export async function getSealManagementCheckName(params: getSealManagementCheckNameQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/seal-management/checkName`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getSealManagementInfo } from "/@/apis/gct-platform/SealManagementController"
 */
export interface getSealManagementInfoQueryInterface {
  id: string; // id
}
export async function getSealManagementInfo(params: getSealManagementInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySealManagementResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/seal-management/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getSealManagementList } from "/@/apis/gct-platform/SealManagementController"
 */
export async function getSealManagementList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSealManagementResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/seal-management/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postSealManagementPageList } from "/@/apis/gct-platform/SealManagementController"
 */
export async function postSealManagementPageList(data: SealManagementRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseSealManagementResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/seal-management/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改密码
 * import { postSealManagementUpdatePassword } from "/@/apis/gct-platform/SealManagementController"
 */
export async function postSealManagementUpdatePassword(data: SealManagementRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/seal-management/updatePassword`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 编辑
 * import { putSealManagementById } from "/@/apis/gct-platform/SealManagementController"
 */
export async function putSealManagementById(data: SealManagementRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/seal-management/{id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}