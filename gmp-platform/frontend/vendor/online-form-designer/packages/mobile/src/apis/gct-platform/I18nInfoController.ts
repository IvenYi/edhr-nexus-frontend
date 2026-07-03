import request from '@mobile/utils/request';
import type { ResponseEntitystring, I18nInfo, ResponseEntityobject, ResponseEntityPageBaseI18nInfoResponse, I18nInfoRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 删除
 * import { deleteI18nInfo } from "/@/apis/gct-platform/I18nInfoController"
 */
export interface deleteI18nInfoQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteI18nInfo(params: deleteI18nInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-info`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 同步多语言
 * import { postI18nInfoExternalLangSync } from "/@/apis/gct-platform/I18nInfoController"
 */
export async function postI18nInfoExternalLangSync(data: I18nInfo[], config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-info/external/lang/sync`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 导出多语言/或导出模板
 * import { getI18nInfoLangDownload } from "/@/apis/gct-platform/I18nInfoController"
 */
export interface getI18nInfoLangDownloadQueryInterface {
  exportData?: boolean; // 是否导出数据 false 不导出,true 导出数据
}
export async function getI18nInfoLangDownload(params: getI18nInfoLangDownloadQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/api/i18n-info/lang/download`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 前端多语言翻译api(前端调用 录入i18n信息 开发阶段使用)
 * import { postI18nInfoLangJson } from "/@/apis/gct-platform/I18nInfoController"
 */
export interface postI18nInfoLangJsonQueryInterface {
  all?: boolean; // 是否全量更新/增量更新 默认否
  tag?: string; // 多语言分类 前端/后端(frontend/backend) 
}
export async function postI18nInfoLangJson(data: undefined, params: postI18nInfoLangJsonQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-info/lang/json`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 多语言翻译
 * import { postI18nInfoLangTrans } from "/@/apis/gct-platform/I18nInfoController"
 */
export interface postI18nInfoLangTransQueryInterface {
  all?: boolean; // 是否全量更新/增量更新 默认否
  tag?: string; // 多语言分类 前端/后端(frontend/backend) 
}
export async function postI18nInfoLangTrans(data: undefined, params: postI18nInfoLangTransQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-info/lang/trans`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 多语言导入
 * import { postI18nInfoLangUpload } from "/@/apis/gct-platform/I18nInfoController"
 */
export interface postI18nInfoLangUploadQueryInterface {
  skipValid?: boolean; // skipValid
}
export async function postI18nInfoLangUpload(data: undefined, params: postI18nInfoLangUploadQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityobject['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-info/lang/upload`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getI18nInfoPageList } from "/@/apis/gct-platform/I18nInfoController"
 */
export interface getI18nInfoPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  searchKey?: string; // searchKey
}
export async function getI18nInfoPageList(params: getI18nInfoPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseI18nInfoResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-info/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 保存或修改
 * import { putI18nInfoByKey } from "/@/apis/gct-platform/I18nInfoController"
 */
export interface putI18nInfoByKeyPathInterface {
  key: string; // key
}
export async function putI18nInfoByKey(path: putI18nInfoByKeyPathInterface, data: I18nInfoRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-info/${path?.key}`,
      method: 'put',
      data,
      ...config,
    },
  );
}