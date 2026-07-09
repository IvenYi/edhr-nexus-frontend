import { defHttp } from '@/utils/http/axios';
import {  } from './model/index';

/**
 * ipaas版本
 * import { getIndexVersion } from "/@/apis/gct-ipaas/IpaasToolController"
 */
export async function getIndexVersion(config = {}): Promise<string> {
  return defHttp.get(
    {
      url: `/gct-ipaas/api/index/version`,
    },
    {
      joinTenantIdToHeader: true,
      joinUserToHeader: true,
      ...config,
    },
  );
}