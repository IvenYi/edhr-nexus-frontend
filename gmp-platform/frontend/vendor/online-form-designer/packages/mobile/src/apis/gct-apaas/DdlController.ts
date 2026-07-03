import request from '@mobile/utils/request';
import type { CreateDatabaseRequest, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 建应用库
 * import { postDdlDatabase } from "/@/apis/gct-apaas/DdlController"
 */
export async function postDdlDatabase(data: CreateDatabaseRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/ddl/database`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删应用库
 * import { postDdlDatabaseDropDatabase } from "/@/apis/gct-apaas/DdlController"
 */
export async function postDdlDatabaseDropDatabase(data: CreateDatabaseRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/ddl/database/dropDatabase`,
      method: 'post',
      data,
      ...config,
    },
  );
}