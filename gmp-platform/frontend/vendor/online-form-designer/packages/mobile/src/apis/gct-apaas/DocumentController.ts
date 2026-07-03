import request from '@mobile/utils/request';
import type { DocumentRequest, ResponseEntitystring, DocumentDTO, ResponseEntityDocumentResponse, ResponseEntityListDocumentResponse, ResponseEntityPageBaseDocumentResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDocument } from "/@/apis/gct-apaas/DocumentController"
 */
export async function postDocument(data: DocumentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除父
 * import { deleteDocument } from "/@/apis/gct-apaas/DocumentController"
 */
export interface deleteDocumentQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteDocument(params: deleteDocumentQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 复制
 * import { postDocumentCopy } from "/@/apis/gct-apaas/DocumentController"
 */
export async function postDocumentCopy(data: DocumentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/copy`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 复制版本
 * import { postDocumentCopyVersionById } from "/@/apis/gct-apaas/DocumentController"
 */
export interface postDocumentCopyVersionByIdPathInterface {
  id: string; // id
}
export async function postDocumentCopyVersionById(path: postDocumentCopyVersionByIdPathInterface, data: DocumentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/copyVersion/${path?.id}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改单据设计数据
 * import { putDocumentDesignById } from "/@/apis/gct-apaas/DocumentController"
 */
export interface putDocumentDesignByIdPathInterface {
  id: string; // id
}
export async function putDocumentDesignById(path: putDocumentDesignByIdPathInterface, data: DocumentDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/design/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 父节点数据清洗
 * import { getDocumentDocumentDataClean } from "/@/apis/gct-apaas/DocumentController"
 */
export async function getDocumentDocumentDataClean(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/documentDataClean`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 根据id查子
 * import { getDocumentGetVersionById } from "/@/apis/gct-apaas/DocumentController"
 */
export interface getDocumentGetVersionByIdQueryInterface {
  id: string; // id
}
export async function getDocumentGetVersionById(params: getDocumentGetVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDocumentResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/getVersionById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDocumentInfo } from "/@/apis/gct-apaas/DocumentController"
 */
export interface getDocumentInfoQueryInterface {
  id: string; // id
}
export async function getDocumentInfo(params: getDocumentInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDocumentResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getDocumentList } from "/@/apis/gct-apaas/DocumentController"
 */
export interface getDocumentListQueryInterface {
  key?: string; // 标签key
  modelKey?: string; // 模型key
}
export async function getDocumentList(params: getDocumentListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocumentResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据父baseId 查所有版本
 * import { getDocumentListVersionById } from "/@/apis/gct-apaas/DocumentController"
 */
export interface getDocumentListVersionByIdQueryInterface {
  baseId: string; // baseId
  name?: string; // 根据名称搜索
}
export async function getDocumentListVersionById(params: getDocumentListVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocumentResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/listVersionById`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDocumentPageList } from "/@/apis/gct-apaas/DocumentController"
 */
export interface getDocumentPageListQueryInterface {
  createUserId?: string; // createUserId
  modifyUserId?: string; // modifyUserId
  name?: string; // name
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  paperSize?: string; // paperSize
}
export async function getDocumentPageList(params: getDocumentPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDocumentResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 删除版本
 * import { deleteDocumentRemoveVersionById } from "/@/apis/gct-apaas/DocumentController"
 */
export interface deleteDocumentRemoveVersionByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteDocumentRemoveVersionById(params: deleteDocumentRemoveVersionByIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/removeVersionById`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 保存版本
 * import { postDocumentSaveVersion } from "/@/apis/gct-apaas/DocumentController"
 */
export async function postDocumentSaveVersion(data: DocumentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/saveVersion`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改版本
 * import { putDocumentUpdateVersionByIdById } from "/@/apis/gct-apaas/DocumentController"
 */
export interface putDocumentUpdateVersionByIdByIdPathInterface {
  id: string; // id
}
export async function putDocumentUpdateVersionByIdById(path: putDocumentUpdateVersionByIdByIdPathInterface, data: DocumentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/updateVersionById/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDocumentById } from "/@/apis/gct-apaas/DocumentController"
 */
export interface putDocumentByIdPathInterface {
  id: string; // id
}
export async function putDocumentById(path: putDocumentByIdPathInterface, data: DocumentRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/document/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}