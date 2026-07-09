import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListI18nConfigResponse, I18nConfigRequest, ResponseEntitystring } from './model/index';

/**
 * 列表
 * import { getI18nConfigList } from "/@/apis/gct-platform/I18nConfigController"
 */
export interface getI18nConfigListQueryInterface {
  keyword?: string; // 搜索关键字
}
export async function getI18nConfigList(params: getI18nConfigListQueryInterface = {}, config = {}): Promise<ResponseEntityListI18nConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/i18n-config/list`,
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
 * import { putI18nConfigById } from "/@/apis/gct-platform/I18nConfigController"
 */
export interface putI18nConfigByIdPathInterface {
  id: string; // id
}
export async function putI18nConfigById(path: putI18nConfigByIdPathInterface, data: I18nConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/i18n-config/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}