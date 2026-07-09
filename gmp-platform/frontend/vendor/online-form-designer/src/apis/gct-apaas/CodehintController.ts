import { defHttp } from '@/utils/http/axios';
import {  } from './model/index';

/**
 * 创建ts文件
 * import { getCodeTsList } from "/@/apis/gct-apaas/CodehintController"
 */
export async function getCodeTsList(config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/code-ts/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}