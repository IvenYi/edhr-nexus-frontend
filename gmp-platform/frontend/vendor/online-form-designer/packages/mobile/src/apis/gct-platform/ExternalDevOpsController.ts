import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 移除沙箱环境数据
 * import { deleteDevopsSbx } from "/@/apis/gct-platform/ExternalDevOpsController"
 */
export interface deleteDevopsSbxQueryInterface {
  appId: string; // appId
}
export async function deleteDevopsSbx(params: deleteDevopsSbxQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/devops/sbx`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 移除并生成沙箱数据
 * import { getDevopsSbxRedoData } from "/@/apis/gct-platform/ExternalDevOpsController"
 */
export interface getDevopsSbxRedoDataQueryInterface {
  appId: string; // appId
}
export async function getDevopsSbxRedoData(params: getDevopsSbxRedoDataQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/devops/sbx/redo/data`,
      method: 'get',
      params,
      ...config,
    },
  );
}