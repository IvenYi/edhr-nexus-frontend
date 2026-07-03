import request from '@mobile/utils/request';
import type { ExcelTmplRequest, ResponseEntitystring, ExcelTemplateConfigReq, ResponseEntityExcelTmplResponse, ResponseEntityListExcelTmplResponse, ResponseEntityPageBaseExcelTmplResponse, ExcelTemplateConfigV1Req } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 模板保存
 * import { postExcelTmpl } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export async function postExcelTmpl(data: ExcelTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl`,
      method: 'post',
      data,
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
export async function deleteExcelTmpl(params: deleteExcelTmplQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 模板配置信息保存
 * import { postExcelTmplConfig } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export async function postExcelTmplConfig(data: ExcelTemplateConfigReq, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/config`,
      method: 'post',
      data,
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
export async function getExcelTmplDetail(params: getExcelTmplDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityExcelTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/detail`,
      method: 'get',
      params,
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
export async function getExcelTmplDownloadPlatById(path: getExcelTmplDownloadPlatByIdPathInterface, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/download-plat/${path?.id}`,
      method: 'get',
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
export async function getExcelTmplDownloadById(path: getExcelTmplDownloadByIdPathInterface, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/download/${path?.id}`,
      method: 'get',
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
export async function getExcelTmplInfo(params: getExcelTmplInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityExcelTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/info`,
      method: 'get',
      params,
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
export async function getExcelTmplInitTmpl(params: getExcelTmplInitTmplQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/init/tmpl`,
      method: 'get',
      params,
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
export async function postExcelTmplInitTmpl(data: ExcelTemplateConfigReq, params: postExcelTmplInitTmplQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/init/tmpl`,
      method: 'post',
      params,
      data,
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
export async function getExcelTmplList(params: getExcelTmplListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListExcelTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/list`,
      method: 'get',
      params,
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
export async function getExcelTmplPageList(params: getExcelTmplPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseExcelTmplResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 新模板配置信息保存
 * import { postExcelTmplV1Config } from "/@/apis/gct-apaas/ExcelTmplController"
 */
export async function postExcelTmplV1Config(data: ExcelTemplateConfigV1Req, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/v1/config`,
      method: 'post',
      data,
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
export async function putExcelTmplById(path: putExcelTmplByIdPathInterface, data: ExcelTmplRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/excel-tmpl/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}