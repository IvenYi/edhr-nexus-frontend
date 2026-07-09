import { defHttp } from '@/utils/http/axios';
import { SelectItem, ResponseEntitystring, ResponseEntityDataSourceProperties } from './model/index';

/**
 * sql格式化
 * import { postDatasourceColumnFormatExternal } from "/@/apis/gct-apaas/DataSourceExternalController"
 */
export interface postDatasourceColumnFormatExternalQueryInterface {
  dbType?: string; // dbType
}
export async function postDatasourceColumnFormatExternal(data: SelectItem, params: postDatasourceColumnFormatExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/datasource/column-format`,
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
 * 业务服务get请求接口
 * import { getDatasourceInfoExternal } from "/@/apis/gct-apaas/DataSourceExternalController"
 */
export async function getDatasourceInfoExternal(config = {}): Promise<ResponseEntityDataSourceProperties['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/datasource/info`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}