import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListDigitsFieldDTO, UpdateDigitsRequest, ResponseEntitystring } from './model/index';

/**
 * 获取所有涉及到精度小数的字段
 * import { getDevopsListAllDigitsFields } from "/@/apis/gct-apaas/DevopsController"
 */
export async function getDevopsListAllDigitsFields(config = {}): Promise<ResponseEntityListDigitsFieldDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/devops/listAllDigitsFields`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 更新精度
 * import { postDevopsUpdateDigits } from "/@/apis/gct-apaas/DevopsController"
 */
export async function postDevopsUpdateDigits(data: UpdateDigitsRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/devops/updateDigits`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}