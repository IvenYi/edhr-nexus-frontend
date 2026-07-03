import request from '@mobile/utils/request';
import type { ResponseEntityPageBaseDocControlStartedResponse, DocControlStartedRequest, ResponseEntitystring, ResponseEntityDocControlStartedResponse, ResponseEntityListDocControlStartedResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 所有数据分页列表
 * import { getDocControlStartedAllPageList } from "/@/apis/gct-apaas/DocControlStartedController"
 */
export interface getDocControlStartedAllPageListQueryInterface {
  categoryId?: string; // 分类ID
  categoryName?: string; // 分类name
  code?: string; // 文件编码
  controlTmplType?: string; // 类型(EDHR,在线表单:FORM)
  createUserId?: string; // 创建人id
  endCreateTime?: string; // 创建时间 - 结束
  name?: string; // 文件名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startCreateTime?: string; // 创建时间 - 开始
  status?: string; // 状态(IN_AUDIT:审核中,ENDED:已退回,FINISHED:已审核)
}
export async function getDocControlStartedAllPageList(params: getDocControlStartedAllPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDocControlStartedResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-control-started/all/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改生效日期
 * import { putDocControlStartedEffectiveDateById } from "/@/apis/gct-apaas/DocControlStartedController"
 */
export interface putDocControlStartedEffectiveDateByIdPathInterface {
  id: string; // id
}
export async function putDocControlStartedEffectiveDateById(path: putDocControlStartedEffectiveDateByIdPathInterface, data: DocControlStartedRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-control-started/effectiveDate/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getDocControlStartedInfo } from "/@/apis/gct-apaas/DocControlStartedController"
 */
export interface getDocControlStartedInfoQueryInterface {
  id: string; // id
}
export async function getDocControlStartedInfo(params: getDocControlStartedInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDocControlStartedResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-control-started/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我发起的受控列表
 * import { getDocControlStartedList } from "/@/apis/gct-apaas/DocControlStartedController"
 */
export interface getDocControlStartedListQueryInterface {
  categoryId?: string; // 分类ID
  code?: string; // 文件编码
  controlTmplType?: string; // 类型(EDHR,在线表单:FORM)
  name?: string; // 文件名称
}
export async function getDocControlStartedList(params: getDocControlStartedListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListDocControlStartedResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-control-started/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 我发起的受控分页列表
 * import { getDocControlStartedPageList } from "/@/apis/gct-apaas/DocControlStartedController"
 */
export interface getDocControlStartedPageListQueryInterface {
  categoryId?: string; // 分类ID
  code?: string; // 文件编码
  controlTmplType?: string; // 类型(EDHR,在线表单:FORM)
  name?: string; // 文件名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getDocControlStartedPageList(params: getDocControlStartedPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDocControlStartedResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/doc-control-started/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}