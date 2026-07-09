import { defHttp } from '@/utils/http/axios';
import { ExcelTmplRequest, ResponseEntitystring, ExcelTemplateConfigReq, ResponseEntityExcelTmplResponse, ResponseEntityListExcelTmplResponse, ResponseEntityPageBaseExcelTmplResponse, ExcelTemplateConfigV1Req } from './model/index';

/**
 * 模板保存
 * import { postExcelTmpl } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export async function postExcelTmpl(data: ExcelTmplRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/excel-tmpl`,
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
 * import { deleteExcelTmpl } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface deleteExcelTmplQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteExcelTmpl(params: deleteExcelTmplQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/excel-tmpl`,
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
 * 模板配置信息保存
 * import { postExcelTmplConfig } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export async function postExcelTmplConfig(data: ExcelTemplateConfigReq, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/excel-tmpl/config`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据模板信息查询
 * import { getExcelTmplDetail } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface getExcelTmplDetailQueryInterface {
  key: string; // 模板key
  modelKey: string; // 模型key
}
export async function getExcelTmplDetail(params: getExcelTmplDetailQueryInterface = {}, config = {}): Promise<ResponseEntityExcelTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel-tmpl/detail`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 平台下载模板
 * import { getExcelTmplDownloadPlatById } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface getExcelTmplDownloadPlatByIdPathInterface {
  id: string; // id
}
export async function getExcelTmplDownloadPlatById(path: getExcelTmplDownloadPlatByIdPathInterface, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel-tmpl/download-plat/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 下载模板
 * import { getExcelTmplDownloadById } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface getExcelTmplDownloadByIdPathInterface {
  id: string; // id
}
export async function getExcelTmplDownloadById(path: getExcelTmplDownloadByIdPathInterface, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel-tmpl/download/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getExcelTmplInfo } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface getExcelTmplInfoQueryInterface {
  id?: string; // id
  key?: string; // key
  modelType?: string; // modelType
}
export async function getExcelTmplInfo(params: getExcelTmplInfoQueryInterface = {}, config = {}): Promise<ResponseEntityExcelTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel-tmpl/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量生成模型模板
 * import { getExcelTmplInitTmpl } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface getExcelTmplInitTmplQueryInterface {
  id?: string; // 模板id
  key?: string; // 模板id
  modelKey?: string; // 模板id
}
export async function getExcelTmplInitTmpl(params: getExcelTmplInitTmplQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel-tmpl/init/tmpl`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量生成模型模板
 * import { postExcelTmplInitTmpl } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface postExcelTmplInitTmplQueryInterface {
  all?: boolean; // 更新全部
}
export async function postExcelTmplInitTmpl(data: ExcelTemplateConfigReq, params: postExcelTmplInitTmplQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/excel-tmpl/init/tmpl`,
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
 * 列表
 * import { getExcelTmplList } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface getExcelTmplListQueryInterface {
  modelKey: string; // 模型key
  type?: string; // 类型：IMPORT-导入;EXPORT-导出
  排序list?: string; // 排序list
}
export async function getExcelTmplList(params: getExcelTmplListQueryInterface = {}, config = {}): Promise<ResponseEntityListExcelTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel-tmpl/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getExcelTmplPageList } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface getExcelTmplPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  排序list?: string; // 排序list
}
export async function getExcelTmplPageList(params: getExcelTmplPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseExcelTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel-tmpl/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 新模板配置信息保存
 * import { postExcelTmplV1Config } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export async function postExcelTmplV1Config(data: ExcelTemplateConfigV1Req, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/excel-tmpl/v1/config`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 模板修改
 * import { putExcelTmplById } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export interface putExcelTmplByIdPathInterface {
  id: string; // id
}
export async function putExcelTmplById(path: putExcelTmplByIdPathInterface, data: ExcelTmplRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/excel-tmpl/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}