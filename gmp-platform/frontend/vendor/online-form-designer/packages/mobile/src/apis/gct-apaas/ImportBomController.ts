import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 导入 bom
 * import { postBomImport } from "/@/apis/gct-apaas/ImportBomController"
 */
export async function postBomImport(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/bom/import`,
      method: 'post',
      data,
      ...config,
    },
  );
}