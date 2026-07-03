import request from '@mobile/utils/request';
import type { ResponseEntityListDigitsFieldDTO, UpdateDigitsRequest, ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取所有涉及到精度小数的字段
 * import { getDevopsListAllDigitsFields } from "/@/apis/gct-apaas/DevopsController"
 */
export async function getDevopsListAllDigitsFields(config:AxiosRequestConfig = {}): Promise<ResponseEntityListDigitsFieldDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/devops/listAllDigitsFields`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 更新精度
 * import { postDevopsUpdateDigits } from "/@/apis/gct-apaas/DevopsController"
 */
export async function postDevopsUpdateDigits(data: UpdateDigitsRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/devops/updateDigits`,
      method: 'post',
      data,
      ...config,
    },
  );
}