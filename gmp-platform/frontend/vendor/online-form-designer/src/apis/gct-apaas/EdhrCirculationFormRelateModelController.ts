import { defHttp } from '@/utils/http/axios';
import { EdhrCirculationFormModelMetaRequest, ResponseEntitystring, ResponseEntityModelMetaDTO, ResponseEntityEdhrCirculationFormModelMetaResponse, ResponseEntityListEdhrCirculationFormModelMetaResponse, ResponseEntityPageBaseEdhrCirculationFormModelMetaResponse } from './model/index';

/**
 * 保存
 * import { postEdhrCirculationFormRelateModel } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export async function postEdhrCirculationFormRelateModel(data: EdhrCirculationFormModelMetaRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel`,
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
 * import { deleteEdhrCirculationFormRelateModel } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface deleteEdhrCirculationFormRelateModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEdhrCirculationFormRelateModel(params: deleteEdhrCirculationFormRelateModelQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel`,
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
 * 根据模型key查询模型和字段详情
 * import { getEdhrCirculationFormRelateModelDetail } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface getEdhrCirculationFormRelateModelDetailQueryInterface {
  modelKey: string; // 模型key
  types?: string; // 需要去除的类型type，多个按','分割
}
export async function getEdhrCirculationFormRelateModelDetail(params: getEdhrCirculationFormRelateModelDetailQueryInterface = {}, config = {}): Promise<ResponseEntityModelMetaDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/detail`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getEdhrCirculationFormRelateModelInfo } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface getEdhrCirculationFormRelateModelInfoQueryInterface {
  id: string; // id
}
export async function getEdhrCirculationFormRelateModelInfo(params: getEdhrCirculationFormRelateModelInfoQueryInterface = {}, config = {}): Promise<ResponseEntityEdhrCirculationFormModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/info`,
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
 * import { getEdhrCirculationFormRelateModelList } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export async function getEdhrCirculationFormRelateModelList(config = {}): Promise<ResponseEntityListEdhrCirculationFormModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEdhrCirculationFormRelateModelPageList } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface getEdhrCirculationFormRelateModelPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getEdhrCirculationFormRelateModelPageList(params: getEdhrCirculationFormRelateModelPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseEdhrCirculationFormModelMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/page/list`,
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
 * import { putEdhrCirculationFormRelateModelById } from "/@/apis/gct-apaas/EdhrCirculationFormRelateModelController"
 */
export interface putEdhrCirculationFormRelateModelByIdPathInterface {
  id: string; // id
}
export async function putEdhrCirculationFormRelateModelById(path: putEdhrCirculationFormRelateModelByIdPathInterface, data: EdhrCirculationFormModelMetaRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/edhr-circulationFormRelateModel/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}