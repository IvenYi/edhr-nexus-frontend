import request from '@mobile/utils/request';
import type { ResponseEntityobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 业务服务通用请求接口
 * import { postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKey(path: postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyPathInterface, data: undefined, params: postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/generalBs/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 业务服务文件上传请求接口
 * import { postModelComprehensiveBizServiceByModelCategoryByModelKeyUpload } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadPathInterface {
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadQueryInterface {
  bsKey: string; // bsKey
  requestParam: any; // requestParam
}
export async function postModelComprehensiveBizServiceByModelCategoryByModelKeyUpload(path: postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadPathInterface, params: postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/upload`,
      method: 'post',
      params,
      ...config,
    },
  );
}

/**
 * 业务服务get请求接口
 * import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(path: getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface, params: getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 业务服务post请求接口
 * import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(path: postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface, data: undefined, params: postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 业务服务put请求接口
 * import { putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(path: putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface, data: undefined, params: putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'put',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 业务服务delete请求接口
 * import { deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface {
  requestParam: any; // requestParam
}
export async function deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(path: deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyPathInterface, data: undefined, params: deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      method: 'delete',
      params,
      data,
joinParamsToUrl: true,
 ...config,
    },
  );
}