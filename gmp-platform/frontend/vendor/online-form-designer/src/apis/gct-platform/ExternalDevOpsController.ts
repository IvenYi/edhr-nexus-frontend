import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 移除沙箱环境数据
 * import { deleteDevopsSbxExternal } from "/@/apis/gct-platform/ExternalDevOpsController"
 */
export interface deleteDevopsSbxExternalQueryInterface {
  appId: string; // appId
}
export async function deleteDevopsSbxExternal(params: deleteDevopsSbxExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/external/api/devops/sbx`,
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
 * 移除并生成沙箱数据
 * import { getDevopsSbxRedoDataExternal } from "/@/apis/gct-platform/ExternalDevOpsController"
 */
export interface getDevopsSbxRedoDataExternalQueryInterface {
  appId: string; // appId
}
export async function getDevopsSbxRedoDataExternal(params: getDevopsSbxRedoDataExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/devops/sbx/redo/data`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}