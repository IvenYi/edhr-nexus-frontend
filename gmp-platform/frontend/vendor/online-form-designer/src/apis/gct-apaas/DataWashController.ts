import { defHttp } from '@/utils/http/axios';
import { ResponseEntitystring } from './model/index';

/**
 * 洗出隐藏的翻译名称字段
 * import { getWashWashDictLabelField } from "/@/apis/gct-apaas/DataWashController"
 */
export async function getWashWashDictLabelField(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/wash/washDictLabelField`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 将edhr实例和在线表单实例中的rdo引用洗成 baseId:id 格式
 * import { getWashWashEdhrAndOfInst } from "/@/apis/gct-apaas/DataWashController"
 */
export async function getWashWashEdhrAndOfInst(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/wash/washEdhrAndOfInst`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}