import request from '@mobile/utils/request';
import type { OfProcessControlRequest, ResponseEntitystring, EdhrTmplCommonRequest, ResponseEntityEdhrTmplResponse, ResponseEntityListEdhrTmplResponse, ResponseEntityboolean, OperatingStateRequest, EdhrTmplRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * eDHR发起受控
 * import { postEdhrTmplControl } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export async function postEdhrTmplControl(data: OfProcessControlRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/control`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 复制
 * import { postEdhrTmplCopyById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface postEdhrTmplCopyByIdPathInterface {
  id: string; // id
}
export async function postEdhrTmplCopyById(path: postEdhrTmplCopyByIdPathInterface, data: EdhrTmplCommonRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/copy/${path?.id}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 复制版本
 * import { postEdhrTmplCopyVersionById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface postEdhrTmplCopyVersionByIdPathInterface {
  id: string; // id
}
export async function postEdhrTmplCopyVersionById(path: postEdhrTmplCopyVersionByIdPathInterface, data: EdhrTmplCommonRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/copyVersion/${path?.id}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据id查子
 * import { getEdhrTmplGetVersionById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface getEdhrTmplGetVersionByIdQueryInterface {
  id: string; // id
}
export async function getEdhrTmplGetVersionById(params: getEdhrTmplGetVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/getVersionById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * edhr查询详情
 * import { getEdhrTmplInfo } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface getEdhrTmplInfoQueryInterface {
  edhrId: string; // id
}
export async function getEdhrTmplInfo(params: getEdhrTmplInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityEdhrTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据父id查子列表
 * import { getEdhrTmplListVersionById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface getEdhrTmplListVersionByIdQueryInterface {
  id: string; // id
}
export async function getEdhrTmplListVersionById(params: getEdhrTmplListVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListEdhrTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/listVersionById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteEdhrTmplRemoveById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface deleteEdhrTmplRemoveByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteEdhrTmplRemoveById(params: deleteEdhrTmplRemoveByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/removeById`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 删除版本
 * import { deleteEdhrTmplRemoveVersionById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface deleteEdhrTmplRemoveVersionByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteEdhrTmplRemoveVersionById(params: deleteEdhrTmplRemoveVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/removeVersionById`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 保存
 * import { postEdhrTmplSave } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export async function postEdhrTmplSave(data: EdhrTmplCommonRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存版本
 * import { postEdhrTmplSaveVersion } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export async function postEdhrTmplSaveVersion(data: EdhrTmplCommonRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/saveVersion`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 设为默认版本
 * import { putEdhrTmplSetDefaultById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface putEdhrTmplSetDefaultByIdPathInterface {
  id: string; // id
}
export async function putEdhrTmplSetDefaultById(path: putEdhrTmplSetDefaultByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/setDefault/${path?.id}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 修改状态
 * import { putEdhrTmplUpdateOperatingStateById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface putEdhrTmplUpdateOperatingStateByIdPathInterface {
  id: string; // id
}
export async function putEdhrTmplUpdateOperatingStateById(path: putEdhrTmplUpdateOperatingStateByIdPathInterface, data: OperatingStateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/updateOperatingState/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改版本
 * import { putEdhrTmplUpdateVersionByIdById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface putEdhrTmplUpdateVersionByIdByIdPathInterface {
  id: string; // id
}
export async function putEdhrTmplUpdateVersionByIdById(path: putEdhrTmplUpdateVersionByIdByIdPathInterface, data: EdhrTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/edhr-tmpl/updateVersionById/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}