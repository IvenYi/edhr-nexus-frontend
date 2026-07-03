import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject } from './model/index';

/**
 * 转发所有POST请求
 * import { postOcr** } from "/@/apis/gct-apaas/OcrController"
 */
export async function postOcr**(config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/ocr/**`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}