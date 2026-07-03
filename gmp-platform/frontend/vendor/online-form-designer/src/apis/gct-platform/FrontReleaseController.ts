import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 清空缓存
 * import { getFrontReleaseCleanCache } from "/@/apis/gct-platform/FrontReleaseController"
 */
export async function getFrontReleaseCleanCache(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/front-release/cleanCache`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}