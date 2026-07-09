import request from '@mobile/utils/request';
import type { ResponseEntityModelMultiRow, ResponseEntityListFieldMeta, ResponseEntityListOnlineFormDataInitProtocolDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取初始化数据
 * import { getOnlineFormDataInitProtocolData } from "/@/apis/gct-apaas/OnlineFormDataInitController"
 */
export interface getOnlineFormDataInitProtocolDataQueryInterface {
  instId: string; // 表单实例id
  protocolKey: string; // 协议key
}
export async function getOnlineFormDataInitProtocolData(params: getOnlineFormDataInitProtocolDataQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityModelMultiRow['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/data-init/protocol/data`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取字段元数据
 * import { getOnlineFormDataInitProtocolFieldMeta } from "/@/apis/gct-apaas/OnlineFormDataInitController"
 */
export interface getOnlineFormDataInitProtocolFieldMetaQueryInterface {
  protocolKey: string; // 协议key
}
export async function getOnlineFormDataInitProtocolFieldMeta(params: getOnlineFormDataInitProtocolFieldMetaQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFieldMeta['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/data-init/protocol/fieldMeta`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 协议列表
 * import { getOnlineFormDataInitProtocolList } from "/@/apis/gct-apaas/OnlineFormDataInitController"
 */
export async function getOnlineFormDataInitProtocolList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOnlineFormDataInitProtocolDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form/data-init/protocol/list`,
      method: 'get',
      ...config,
    },
  );
}