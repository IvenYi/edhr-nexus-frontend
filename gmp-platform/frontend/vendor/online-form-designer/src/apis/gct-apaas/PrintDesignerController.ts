import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring, ResponseEntityPrintRelateDTO, ResponseEntityListPrintRelateDTO, ResponseEntityPageBasePrintRelateDTO } from './model/index';

/**
 * 分类删除(前台删除api)
 * import { deletePrintDesignerCategory } from "/@/apis/gct-apaas/PrintDesignerController"
 */
export interface deletePrintDesignerCategoryQueryInterface {
  id: string; // 分类id
  moduleType: string; // label_module 标签打印模块/document_module 单据打印
}
export async function deletePrintDesignerCategory(params: deletePrintDesignerCategoryQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/print-designer/category`,
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
 * 详情
 * import { getPrintDesignerInfo } from "/@/apis/gct-apaas/PrintDesignerController"
 */
export interface getPrintDesignerInfoQueryInterface {
  id: string; // id
  moduleType: string; // label_module 标签打印模块/document_module 单据打印
}
export async function getPrintDesignerInfo(params: getPrintDesignerInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPrintRelateDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/print-designer/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPrintDesignerListAllVersion(params: getPrintDesignerListAllVersionQueryInterface = {}, config = {}): Promise<ResponseEntityListPrintRelateDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/print-designer/listAllVersion`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPrintDesignerRdoPageBaseList(params: getPrintDesignerRdoPageBaseListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePrintRelateDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/print-designer/rdo/page/base/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPrintDesignerRdoPageList(params: getPrintDesignerRdoPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePrintRelateDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/print-designer/rdo/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}