import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject } from './model/index';

/**
 * 业务服务通用请求接口
 * import { postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyExternal } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyExternalPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyExternalQueryInterface {
  requestParam: any; // requestParam
}
export async function postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyExternal(path: postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyExternalPathInterface, data: any, params: postModelComprehensiveBizServiceGeneralBsByModelCategoryByModelKeyByBsKeyExternalQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/generalBs/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 业务服务文件上传请求接口
 * import { postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadExternal } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadExternalPathInterface {
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadExternalQueryInterface {
  bsKey: string; // bsKey
  requestParam: any; // requestParam
}
export async function postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadExternal(path: postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadExternalPathInterface, data: any, params: postModelComprehensiveBizServiceByModelCategoryByModelKeyUploadExternalQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/upload`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 业务服务get请求接口
 * import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalQueryInterface {
  requestParam: any; // requestParam
}
export async function getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal(path: getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalPathInterface, params: getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 业务服务post请求接口
 * import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalQueryInterface {
  requestParam: any; // requestParam
}
export async function postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal(path: postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalPathInterface, data: any, params: postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 业务服务put请求接口
 * import { putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalQueryInterface {
  requestParam: any; // requestParam
}
export async function putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal(path: putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalPathInterface, data: any, params: putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 业务服务delete请求接口
 * import { deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal } from "/@/apis/gct-apaas/ModelComprehensiveExternalController"
 */
export interface deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalPathInterface {
  bsKey: string; // bsKey
  modelCategory: string; // modelCategory
  modelKey: string; // modelKey
}
export interface deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalQueryInterface {
  requestParam: any; // requestParam
}
export async function deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal(path: deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalPathInterface, data: any, params: deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternalQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/external/api/model-comprehensive/biz-service/${path?.modelCategory}/${path?.modelKey}/${path?.bsKey}`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}