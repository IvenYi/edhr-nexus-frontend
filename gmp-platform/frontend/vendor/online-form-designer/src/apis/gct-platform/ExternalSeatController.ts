import { defHttp } from '@/utils/http/axios';
import {  } from './model/index';

/**
 * 添加席位
 * import { postSeatAddExternal } from "/@/apis/gct-platform/ExternalSeatController"
 */
export interface postSeatAddExternalQueryInterface {
  flag: number; // flag
}
export async function postSeatAddExternal(data: string[], params: postSeatAddExternalQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/seat/add`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}