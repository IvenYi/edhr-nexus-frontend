import request from '@mobile/utils/request';
import type { OnlineFormSaveRequest, ResponseEntitystring, OnlineFormVersionCopy, ResponseEntityOnlineFormResponse, OnlineFormFieldMetaVO, OnlineFormOperationConfig, OnlineFormVersion, OnlineFormDesigner, OnlineFormUpdateRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postOnlineForm } from "/@/apis/gct-apaas/OnlineFormController"
 */
export async function postOnlineForm(data: OnlineFormSaveRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteOnlineForm } from "/@/apis/gct-apaas/OnlineFormController"
 */
export interface deleteOnlineFormQueryInterface {
  id: string; // 删除的id
}
export async function deleteOnlineForm(params: deleteOnlineFormQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 复制版本
 * import { postOnlineFormCopyVersion } from "/@/apis/gct-apaas/OnlineFormController"
 */
export async function postOnlineFormCopyVersion(data: OnlineFormVersionCopy, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/copyVersion`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getOnlineFormInfo } from "/@/apis/gct-apaas/OnlineFormController"
 */
export interface getOnlineFormInfoQueryInterface {
  id: string; // id
}
export async function getOnlineFormInfo(params: getOnlineFormInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityOnlineFormResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 新建字段
 * import { postOnlineFormSaveField } from "/@/apis/gct-apaas/OnlineFormController"
 */
export async function postOnlineFormSaveField(data: OnlineFormFieldMetaVO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/saveField`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 页面设置
 * import { postOnlineFormSaveOperation } from "/@/apis/gct-apaas/OnlineFormController"
 */
export async function postOnlineFormSaveOperation(data: OnlineFormOperationConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/saveOperation`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存版本
 * import { postOnlineFormSaveVersion } from "/@/apis/gct-apaas/OnlineFormController"
 */
export async function postOnlineFormSaveVersion(data: OnlineFormVersion, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/saveVersion`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 保存设计
 * import { postOnlineFormUpdateDesigner } from "/@/apis/gct-apaas/OnlineFormController"
 */
export async function postOnlineFormUpdateDesigner(data: OnlineFormDesigner, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/updateDesigner`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putOnlineFormById } from "/@/apis/gct-apaas/OnlineFormController"
 */
export interface putOnlineFormByIdPathInterface {
  id: string; // id
}
export async function putOnlineFormById(path: putOnlineFormByIdPathInterface, data: OnlineFormUpdateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}