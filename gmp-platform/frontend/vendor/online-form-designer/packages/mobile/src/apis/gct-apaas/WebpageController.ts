import request from '@mobile/utils/request';
import type { WebpageRequest, ResponseEntitystring, WebPageLockRequest, ResponseEntityWebPageOccupyResponse, ResponseEntityWebpageResponse, ResponseEntityListWebpageResponse, ResponseEntityPageBaseWebpageResponse, WebpageDesignerJsonRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postWebpage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpage(data: WebpageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteWebpage } from "/@/apis/gct-apaas/WebpageController"
 */
export interface deleteWebpageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteWebpage(params: deleteWebpageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 取消webPage页面占用
 * import { postWebpageCancelOccupyWebPage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageCancelOccupyWebPage(data: WebPageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/cancelOccupyWebPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 复制页面
 * import { postWebpageCopyByIdById } from "/@/apis/gct-apaas/WebpageController"
 */
export interface postWebpageCopyByIdByIdPathInterface {
  id: string; // 原页面Id
}
export async function postWebpageCopyByIdById(path: postWebpageCopyByIdByIdPathInterface, data: WebpageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/copyById/${path?.id}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 获取webPage页面占用信息
 * import { postWebpageGetWebPageOccupyMsg } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageGetWebPageOccupyMsg(data: WebPageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityWebPageOccupyResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/getWebPageOccupyMsg`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getWebpageInfo } from "/@/apis/gct-apaas/WebpageController"
 */
export interface getWebpageInfoQueryInterface {
  id: string; // id
  type?: number; // type
}
export async function getWebpageInfo(params: getWebpageInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityWebpageResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getWebpageList } from "/@/apis/gct-apaas/WebpageController"
 */
export async function getWebpageList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListWebpageResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 锁定webPage页面
 * import { postWebpageLockWebPage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageLockWebPage(data: WebPageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/lockWebPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 占用webPage页面进行编辑
 * import { postWebpageOccupyWebPage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageOccupyWebPage(data: WebPageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/occupyWebPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getWebpagePageList } from "/@/apis/gct-apaas/WebpageController"
 */
export interface getWebpagePageListQueryInterface {
  description?: string; // 页面描述
  endTime?: string; // 结束时间
  id?: string; // 主键id
  key?: string; // 页面key
  name?: string; // 页面名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getWebpagePageList(params: getWebpagePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseWebpageResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 解除锁定webPage页面
 * import { postWebpageUnLockWebPage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageUnLockWebPage(data: WebPageLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/unLockWebPage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改webPage页面设计Json
 * import { putWebpageUpdateDesignerJsonById } from "/@/apis/gct-apaas/WebpageController"
 */
export interface putWebpageUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putWebpageUpdateDesignerJsonById(path: putWebpageUpdateDesignerJsonByIdPathInterface, data: WebpageDesignerJsonRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/updateDesignerJson/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putWebpageById } from "/@/apis/gct-apaas/WebpageController"
 */
export interface putWebpageByIdPathInterface {
  id: string; // id
}
export async function putWebpageById(path: putWebpageByIdPathInterface, data: WebpageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/webpage/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}