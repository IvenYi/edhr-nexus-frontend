import { defHttp } from '@/utils/http/axios';
import { I18nInfoRequest, ResponseEntitystring, ResponseEntityobject, ResponseEntityPageBaseI18nInfoResponse } from './model/index';

/**
 * 保存
 * import { postI18nInfo } from "/@/apis/gct-apaas/I18nInfoController"
 */
export async function postI18nInfo(data: I18nInfoRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/i18n-info`,
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
 * import { deleteI18nInfo } from "/@/apis/gct-apaas/I18nInfoController"
 */
export interface deleteI18nInfoQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteI18nInfo(params: deleteI18nInfoQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/i18n-info`,
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
 * 导出多语言/或导出模板
 * import { getI18nInfoLangDownload } from "/@/apis/gct-apaas/I18nInfoController"
 */
export interface getI18nInfoLangDownloadQueryInterface {
  exportData?: boolean; // 是否导出数据 false 不导出,true 导出数据
}
export async function getI18nInfoLangDownload(params: getI18nInfoLangDownloadQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/i18n-info/lang/download`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 多语言导入
 * import { postI18nInfoLangUpload } from "/@/apis/gct-apaas/I18nInfoController"
 */
export interface postI18nInfoLangUploadQueryInterface {
  skipValid?: boolean; // skipValid
}
export async function postI18nInfoLangUpload(data: any, params: postI18nInfoLangUploadQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/i18n-info/lang/upload`,
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
 * 分页列表
 * import { getI18nInfoPageList } from "/@/apis/gct-apaas/I18nInfoController"
 */
export interface getI18nInfoPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  searchKey?: string; // searchKey
}
export async function getI18nInfoPageList(params: getI18nInfoPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseI18nInfoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/i18n-info/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putI18nInfoByKey } from "/@/apis/gct-apaas/I18nInfoController"
 */
export interface putI18nInfoByKeyPathInterface {
  key: string; // key
}
export async function putI18nInfoByKey(path: putI18nInfoByKeyPathInterface, data: I18nInfoRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/i18n-info/${path?.key}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}