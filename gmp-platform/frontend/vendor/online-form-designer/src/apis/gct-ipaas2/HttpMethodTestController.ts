import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 测试http 请求方式api
 * import { headTestConnect } from "/@/apis/gct-ipaas2/HttpMethodTestController"
 */
export async function headTestConnect(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.head(
    {
      url: `/gct-ipaas/api/test/connect`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试http 请求方式api
 * import { patchTestConnect } from "/@/apis/gct-ipaas2/HttpMethodTestController"
 */
export async function patchTestConnect(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.patch(
    {
      url: `/gct-ipaas/api/test/connect`,
    },
    {
      joinUserToHeader: true,
      ...config,
    },
  );
}