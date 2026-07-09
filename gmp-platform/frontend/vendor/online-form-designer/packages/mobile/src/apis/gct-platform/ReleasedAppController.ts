import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 禁用
 * import { putReleasedAppDisableByAppId } from "/@/apis/gct-platform/ReleasedAppController"
 */
export interface putReleasedAppDisableByAppIdPathInterface {
  appId: string; // appId
}
export async function putReleasedAppDisableByAppId(path: putReleasedAppDisableByAppIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/released/app/disable/${path?.appId}`,
      method: 'put',
      ...config,
    },
  );
}

/**
 * 启用
 * import { putReleasedAppEnableByAppId } from "/@/apis/gct-platform/ReleasedAppController"
 */
export interface putReleasedAppEnableByAppIdPathInterface {
  appId: string; // appId
}
export async function putReleasedAppEnableByAppId(path: putReleasedAppEnableByAppIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/released/app/enable/${path?.appId}`,
      method: 'put',
      ...config,
    },
  );
}