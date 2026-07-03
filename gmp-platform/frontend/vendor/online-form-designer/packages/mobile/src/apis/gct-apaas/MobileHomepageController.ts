import request from '@mobile/utils/request';
import type { MobileHomepageRequest, ResponseEntitystring, ResponseEntityMobileHomepageResponse, ResponseEntityListMobileHomepageResponse, ResponseEntityPageBaseMobileHomepageResponse, SingleRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postMobileHomepage } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export async function postMobileHomepage(data: MobileHomepageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteMobileHomepage } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface deleteMobileHomepageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMobileHomepage(params: deleteMobileHomepageQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 查询选中的
 * import { getMobileHomepageGetSelected } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export async function getMobileHomepageGetSelected(config:AxiosRequestConfig = {}): Promise<ResponseEntityMobileHomepageResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage/getSelected`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getMobileHomepageInfo } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface getMobileHomepageInfoQueryInterface {
  id: string; // id
}
export async function getMobileHomepageInfo(params: getMobileHomepageInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMobileHomepageResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getMobileHomepageList } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export async function getMobileHomepageList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListMobileHomepageResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMobileHomepagePageList } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface getMobileHomepagePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getMobileHomepagePageList(params: getMobileHomepagePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseMobileHomepageResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 选中页面，不传id代表都不选中
 * import { postMobileHomepageSelect } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export async function postMobileHomepageSelect(data: SingleRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage/select`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改页面设计Json
 * import { putMobileHomepageUpdateDesignerJsonById } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface putMobileHomepageUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putMobileHomepageUpdateDesignerJsonById(path: putMobileHomepageUpdateDesignerJsonByIdPathInterface, data: MobileHomepageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage/updateDesignerJson/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putMobileHomepageById } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface putMobileHomepageByIdPathInterface {
  id: string; // id
}
export async function putMobileHomepageById(path: putMobileHomepageByIdPathInterface, data: MobileHomepageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/mobile-homepage/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}