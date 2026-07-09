import request from '@mobile/utils/request';
import type {  } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 添加席位
 * import { postSeatAdd } from "/@/apis/gct-platform/ExternalSeatController"
 */
export interface postSeatAddQueryInterface {
  flag: number; // flag
}
export async function postSeatAdd(data: undefined[], params: postSeatAddQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/external/api/seat/add`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}