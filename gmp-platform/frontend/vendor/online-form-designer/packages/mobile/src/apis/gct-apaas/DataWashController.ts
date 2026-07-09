import request from '@mobile/utils/request';
import type { ResponseEntitystring } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 洗出隐藏的翻译名称字段
 * import { getWashWashDictLabelField } from "/@/apis/gct-apaas/DataWashController"
 */
export async function getWashWashDictLabelField(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/wash/washDictLabelField`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 将edhr实例和在线表单实例中的rdo引用洗成 baseId:id 格式
 * import { getWashWashEdhrAndOfInst } from "/@/apis/gct-apaas/DataWashController"
 */
export async function getWashWashEdhrAndOfInst(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/wash/washEdhrAndOfInst`,
      method: 'get',
      ...config,
    },
  );
}