import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 消息关闭
 * import { getSeatMessageCloseById } from "/@/apis/gct-platform/SeatMessageController"
 */
export interface getSeatMessageCloseByIdPathInterface {
  id: string; // id
}
export async function getSeatMessageCloseById(path: getSeatMessageCloseByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seat-message/close/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}