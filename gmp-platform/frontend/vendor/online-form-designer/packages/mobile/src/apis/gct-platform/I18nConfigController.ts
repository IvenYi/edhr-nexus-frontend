import request from '@mobile/utils/request';
import type { ResponseEntityListI18nConfigResponse, I18nConfigRequest, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 列表
 * import { getI18nConfigList } from "/@/apis/gct-platform/I18nConfigController"
 */
export interface getI18nConfigListQueryInterface {
  keyword?: string; // 搜索关键字
}
export async function getI18nConfigList(params: getI18nConfigListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListI18nConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-config/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putI18nConfigById } from "/@/apis/gct-platform/I18nConfigController"
 */
export interface putI18nConfigByIdPathInterface {
  id: string; // id
}
export async function putI18nConfigById(path: putI18nConfigByIdPathInterface, data: I18nConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/i18n-config/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}