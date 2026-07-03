import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 消息关闭
 * import { getSeatMessageCloseById } from "/@/apis/gct-platform/SeatMessageController"
 */
export interface getSeatMessageCloseByIdPathInterface {
  id: string; // id
}
export async function getSeatMessageCloseById(path: getSeatMessageCloseByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/seat-message/close/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}