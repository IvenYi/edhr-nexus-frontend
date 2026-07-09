import request from '@mobile/utils/request';
import type { ResponseEntityPageBaseDataSourceDTO, DataSourceSelectRequest, ResponseEntityListMapstringobject } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 分页查询
 * import { getDataSourcePageList } from "/@/apis/gct-apaas/DataSourceController"
 */
export interface getDataSourcePageListQueryInterface {
  enabled?: number; // enabled
  name?: string; // name
  pageNo: number; // pageNo
  pageSize: number; // pageSize
}
export async function getDataSourcePageList(params: getDataSourcePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDataSourceDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-source/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 使用sql查询数据
 * import { postDataSourceSelect } from "/@/apis/gct-apaas/DataSourceController"
 */
export async function postDataSourceSelect(data: DataSourceSelectRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return request(
    {
      url: `/gct-apaas/api/data-source/select`,
      method: 'post',
      data,
      ...config,
    },
  );
}