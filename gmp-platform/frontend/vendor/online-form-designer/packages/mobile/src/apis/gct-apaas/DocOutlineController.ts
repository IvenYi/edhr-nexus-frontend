import request from '@mobile/utils/request';
import type { DocOutlineRequest, ResponseEntitystring, ResponseEntityboolean, DocOutlineSortDTO, ResponseEntityDocOutlineResponse, ResponseEntityListDocOutlineResponse, ResponseEntityPageBaseDocOutlineResponse, ResponseEntityListDocOutlineBase } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postDocOutline } from "/@/apis/gct-apaas/DocOutlineController"
 */
export async function postDocOutline(data: DocOutlineRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteDocOutline } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface deleteDocOutlineQueryInterface {
  id: string; // 删除的id
}
export async function deleteDocOutline(params: deleteDocOutlineQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 拖拽排序
 * import { postDocOutlineDrag } from "/@/apis/gct-apaas/DocOutlineController"
 */
export async function postDocOutlineDrag(data: DocOutlineSortDTO, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/drag`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDocOutlineInfo } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface getDocOutlineInfoQueryInterface {
  id: string; // id
}
export async function getDocOutlineInfo(params: getDocOutlineInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDocOutlineResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 大纲目录列表
 * import { getDocOutlineList } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface getDocOutlineListQueryInterface {
  baseId: string; // eDHR id
}
export async function getDocOutlineList(params: getDocOutlineListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocOutlineResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * (新)根据实例id查询 大纲目录列表
 * import { getDocOutlineListByInstance } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface getDocOutlineListByInstanceQueryInterface {
  id: string; // eDHR 实例id
}
export async function getDocOutlineListByInstance(params: getDocOutlineListByInstanceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocOutlineResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/listByInstance`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 大纲目录列表(根据edhr的引用id进行查询)(废弃)
 * import { getDocOutlineListByRefId } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface getDocOutlineListByRefIdQueryInterface {
  refId: string; // eDHR ref id
}
export async function getDocOutlineListByRefId(params: getDocOutlineListByRefIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocOutlineResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/listByRefId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getDocOutlinePageList } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface getDocOutlinePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDocOutlinePageList(params: getDocOutlinePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDocOutlineResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询EDHR sheet 排序列表
 * import { getDocOutlineSheet } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface getDocOutlineSheetQueryInterface {
  id: string; // EDHR ID
}
export async function getDocOutlineSheet(params: getDocOutlineSheetQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocOutlineBase['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/sheet`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询EDHR sheet 排序列表(根据edhr实例ID进行查询)
 * import { getDocOutlineSheetByInstance } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface getDocOutlineSheetByInstanceQueryInterface {
  id: string; // EDHR 实例 ID
}
export async function getDocOutlineSheetByInstance(params: getDocOutlineSheetByInstanceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocOutlineBase['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/sheetByInstance`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询EDHR sheet 排序列表(根据edhr的引用id进行查询) 废弃
 * import { getDocOutlineSheetByRefId } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface getDocOutlineSheetByRefIdQueryInterface {
  refId: string; // EDHR ID
}
export async function getDocOutlineSheetByRefId(params: getDocOutlineSheetByRefIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocOutlineBase['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/sheetByRefId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putDocOutlineById } from "/@/apis/gct-apaas/DocOutlineController"
 */
export interface putDocOutlineByIdPathInterface {
  id: string; // id
}
export async function putDocOutlineById(path: putDocOutlineByIdPathInterface, data: DocOutlineRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-outline/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}