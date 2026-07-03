import { defHttp } from '@/utils/http/axios';
import { ResponseEntityPageBaseDataSourceDTO, DataSourceSelectRequest, ResponseEntityListMapstringobject } from './model/index';

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
export async function getDataSourcePageList(params: getDataSourcePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseDataSourceDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/data-source/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 使用sql查询数据
 * import { postDataSourceSelect } from "/@/apis/gct-apaas/DataSourceController"
 */
export async function postDataSourceSelect(data: DataSourceSelectRequest, config = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/data-source/select`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}