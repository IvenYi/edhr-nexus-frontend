import request from '@mobile/utils/request';
import type { RegexpRequest, ResponseEntitystring, ResponseEntityRegexpResponse, ResponseEntityListRegexpResponse, ResponseEntityPageBaseRegexpResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postRegexp } from "/@/apis/gct-platform/RegexpController"
 */
export async function postRegexp(data: RegexpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/regexp`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteRegexp } from "/@/apis/gct-platform/RegexpController"
 */
export interface deleteRegexpQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteRegexp(params: deleteRegexpQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/regexp`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getRegexpInfo } from "/@/apis/gct-platform/RegexpController"
 */
export interface getRegexpInfoQueryInterface {
  id: string; // id
}
export async function getRegexpInfo(params: getRegexpInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityRegexpResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/regexp/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getRegexpList } from "/@/apis/gct-platform/RegexpController"
 */
export async function getRegexpList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListRegexpResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/regexp/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getRegexpPageList } from "/@/apis/gct-platform/RegexpController"
 */
export interface getRegexpPageListQueryInterface {
  endTime?: string; // 结束时间
  name?: string; // 正则名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  value?: string; // 正则值
}
export async function getRegexpPageList(params: getRegexpPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseRegexpResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/regexp/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putRegexpById } from "/@/apis/gct-platform/RegexpController"
 */
export interface putRegexpByIdPathInterface {
  id: string; // id
}
export async function putRegexpById(path: putRegexpByIdPathInterface, data: RegexpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/regexp/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}