import request from '@mobile/utils/request';
import type { ResponseEntitystring, ResponseEntityPrintRelateDTO, ResponseEntityListPrintRelateDTO, ResponseEntityPageBasePrintRelateDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 分类删除(前台删除api)
 * import { deletePrintDesignerCategory } from "/@/apis/gct-apaas/PrintDesignerController"
 */
export interface deletePrintDesignerCategoryQueryInterface {
  id: string; // 分类id
  moduleType: string; // label_module 标签打印模块/document_module 单据打印
}
export async function deletePrintDesignerCategory(params: deletePrintDesignerCategoryQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/print-designer/category`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPrintDesignerInfo } from "/@/apis/gct-apaas/PrintDesignerController"
 */
export interface getPrintDesignerInfoQueryInterface {
  id: string; // id
  moduleType: string; // label_module 标签打印模块/document_module 单据打印
}
export async function getPrintDesignerInfo(params: getPrintDesignerInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPrintRelateDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/print-designer/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 标签/单据 所有版本
 * import { getPrintDesignerListAllVersion } from "/@/apis/gct-apaas/PrintDesignerController"
 */
export interface getPrintDesignerListAllVersionQueryInterface {
  baseId: string; // baseId
  moduleType: string; // label_module 标签打印模块/document_module 单据打印
  name?: string; // name
}
export async function getPrintDesignerListAllVersion(params: getPrintDesignerListAllVersionQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListPrintRelateDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/print-designer/listAllVersion`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 标签分页列表不含版本
 * import { getPrintDesignerRdoPageBaseList } from "/@/apis/gct-apaas/PrintDesignerController"
 */
export interface getPrintDesignerRdoPageBaseListQueryInterface {
  categoryId: string; // categoryId
  modelKey?: string; // 模型key
  moduleType: string; // label_module 标签打印模块/document_module 单据打印
  name?: string; // name
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPrintDesignerRdoPageBaseList(params: getPrintDesignerRdoPageBaseListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePrintRelateDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/print-designer/rdo/page/base/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 标签分页列表含版本
 * import { getPrintDesignerRdoPageList } from "/@/apis/gct-apaas/PrintDesignerController"
 */
export interface getPrintDesignerRdoPageListQueryInterface {
  categoryId: string; // categoryId
  modelKey?: string; // 模型key
  moduleType: string; // label_module 标签打印模块/document_module 单据打印
  name?: string; // name
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPrintDesignerRdoPageList(params: getPrintDesignerRdoPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePrintRelateDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/print-designer/rdo/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}