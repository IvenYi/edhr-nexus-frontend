import request from '@mobile/utils/request';

import type { AxiosRequestConfig } from 'axios';

/**
 * 创建ts文件
 * import { getCodeTsList } from "/@/apis/gct-apaas/CodehintController"
 */
export async function getCodeTsList(config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/api/code-ts/list`,
      method: 'get',
      ...config,
    },
  );
}