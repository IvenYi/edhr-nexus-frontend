import request from '@mobile/utils/request';
import type { SelectItem, ResponseEntitystring, ResponseEntityDataSourceProperties } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * sql格式化
 * import { postDatasourceColumnFormat } from "/@/apis/gct-apaas/DataSourceExternalController"
 */
export interface postDatasourceColumnFormatQueryInterface {
  dbType?: string; // dbType
}
export async function postDatasourceColumnFormat(data: SelectItem, params: postDatasourceColumnFormatQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/datasource/column-format`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 业务服务get请求接口
 * import { getDatasourceInfo } from "/@/apis/gct-apaas/DataSourceExternalController"
 */
export async function getDatasourceInfo(config:AxiosRequestConfig = {}): Promise<ResponseEntityDataSourceProperties['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/datasource/info`,
      method: 'get',
      ...config,
    },
  );
}