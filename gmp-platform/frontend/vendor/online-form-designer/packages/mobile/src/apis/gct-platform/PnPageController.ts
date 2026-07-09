import request from '@mobile/utils/request';
import type { PnPageRequest, ResponseEntitystring, ResponseEntityPnPageResponse, ResponseEntityListPnPageResponse, ResponseEntityPageBasePnPageResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPnPage } from "/@/apis/gct-platform/PnPageController"
 */
export async function postPnPage(data: PnPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-page`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deletePnPage } from "/@/apis/gct-platform/PnPageController"
 */
export interface deletePnPageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePnPage(params: deletePnPageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-page`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getPnPageInfo } from "/@/apis/gct-platform/PnPageController"
 */
export interface getPnPageInfoQueryInterface {
  id: string; // id
}
export async function getPnPageInfo(params: getPnPageInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPnPageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-page/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPnPageList } from "/@/apis/gct-platform/PnPageController"
 */
export async function getPnPageList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPnPageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-page/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPnPagePageList } from "/@/apis/gct-platform/PnPageController"
 */
export interface getPnPagePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPnPagePageList(params: getPnPagePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePnPageResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-page/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putPnPageById } from "/@/apis/gct-platform/PnPageController"
 */
export interface putPnPageByIdPathInterface {
  id: string; // id
}
export async function putPnPageById(path: putPnPageByIdPathInterface, data: PnPageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/pn-page/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}