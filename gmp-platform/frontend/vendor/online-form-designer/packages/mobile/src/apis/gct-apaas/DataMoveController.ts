import request from '@mobile/utils/request';
import type { DatasourceMove, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 数据迁移
 * import { postDatamoveExecute } from "/@/apis/gct-apaas/DataMoveController"
 */
export async function postDatamoveExecute(data: DatasourceMove, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/datamove/execute`,
      method: 'post',
      data,
      ...config,
    },
  );
}