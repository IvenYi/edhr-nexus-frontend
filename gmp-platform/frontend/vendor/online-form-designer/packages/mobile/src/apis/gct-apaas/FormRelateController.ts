import request from '@mobile/utils/request';
import type { ResponseEntityVoid, ResponseEntityFormRelateDTO, ResponseEntityListCategoryCompleteResponse, ResponseEntityListFormRelateDTO, ResponseEntityPageBaseOnlineFormModelMeta, ResponseEntityPageBaseFormRelateDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 分类删除
 * import { deleteFormRelateDeleteCategory } from "/@/apis/gct-apaas/FormRelateController"
 */
export interface deleteFormRelateDeleteCategoryQueryInterface {
  id: string; // 删除的分类id
  moduleType: string; // 模块类型
}
export async function deleteFormRelateDeleteCategory(params: deleteFormRelateDeleteCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityVoid['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/deleteCategory`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 在线表单/eDHR 模板详情
 * import { getFormRelateInfo } from "/@/apis/gct-apaas/FormRelateController"
 */
export interface getFormRelateInfoQueryInterface {
  id: string; // id
  moduleType: string; // moduleType
}
export async function getFormRelateInfo(params: getFormRelateInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityFormRelateDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 在线表单/eDHR 所有分类
 * import { getFormRelateListAllCategory } from "/@/apis/gct-apaas/FormRelateController"
 */
export interface getFormRelateListAllCategoryQueryInterface {
  moduleType: string; // moduleType
  name?: string; // name
}
export async function getFormRelateListAllCategory(params: getFormRelateListAllCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListCategoryCompleteResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/listAllCategory`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 在线表单/eDHR 所有版本
 * import { getFormRelateListAllVersion } from "/@/apis/gct-apaas/FormRelateController"
 */
export interface getFormRelateListAllVersionQueryInterface {
  baseId: string; // baseId
  moduleType: string; // moduleType
  name?: string; // name
}
export async function getFormRelateListAllVersion(params: getFormRelateListAllVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFormRelateDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/listAllVersion`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 在线表单获取模型接口
 * import { getFormRelatePageListAllModelKey } from "/@/apis/gct-apaas/FormRelateController"
 */
export interface getFormRelatePageListAllModelKeyQueryInterface {
  name?: string; // name
  pageNo: number; // pageNo
  pageSize: number; // pageSize
}
export async function getFormRelatePageListAllModelKey(params: getFormRelatePageListAllModelKeyQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseOnlineFormModelMeta['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/page/listAllModelKey`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 在线表单/eDHR 分页列表含版本
 * import { getFormRelatePageListFormAppendChild } from "/@/apis/gct-apaas/FormRelateController"
 */
export interface getFormRelatePageListFormAppendChildQueryInterface {
  categoryId?: string; // categoryId
  code?: string; // 表单编码
  configured?: boolean; // 是否返回配置过流程属性
  controlStatus?: string; // 受控状态(UNCONTROLLED:期初,RUNNING:受控中,CONTROLLED:已受控)
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  moduleType: string; // moduleType
  name?: string; // name
  pageNo: number; // pageNo
  pageSize: number; // pageSize
}
export async function getFormRelatePageListFormAppendChild(params: getFormRelatePageListFormAppendChildQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseFormRelateDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/page/listFormAppendChild`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 在线表单/eDHR 分页列表不含版本
 * import { getFormRelatePageListFormNoChild } from "/@/apis/gct-apaas/FormRelateController"
 */
export interface getFormRelatePageListFormNoChildQueryInterface {
  categoryId?: string; // categoryId
  code?: string; // 表单编码
  formType?: string; // 表单类型：BASE 基础表单、PROCESS 流程表单、VIEW视图表单、TEXT文本表单
  moduleType: string; // moduleType
  name?: string; // name
  pageNo: number; // pageNo
  pageSize: number; // pageSize
}
export async function getFormRelatePageListFormNoChild(params: getFormRelatePageListFormNoChildQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseFormRelateDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/formRelate/page/listFormNoChild`,
      method: 'get',
      params,
      ...config,
    },
  );
}