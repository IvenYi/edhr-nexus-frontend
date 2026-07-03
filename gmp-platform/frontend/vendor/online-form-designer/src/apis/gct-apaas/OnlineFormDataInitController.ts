import { defHttp } from '@/utils/http/axios';
import { ResponseEntityModelMultiRow, ResponseEntityListFieldMeta, ResponseEntityListOnlineFormDataInitProtocolDTO } from './model/index';

/**
 * 获取初始化数据
 * import { getOnlineFormDataInitProtocolData } from "/@/apis/gct-apaas/OnlineFormDataInitController"
 */
export interface getOnlineFormDataInitProtocolDataQueryInterface {
  instId: string; // 表单实例id
  protocolKey: string; // 协议key
}
export async function getOnlineFormDataInitProtocolData(params: getOnlineFormDataInitProtocolDataQueryInterface = {}, config = {}): Promise<ResponseEntityModelMultiRow['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form/data-init/protocol/data`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getOnlineFormDataInitProtocolFieldMeta(params: getOnlineFormDataInitProtocolFieldMetaQueryInterface = {}, config = {}): Promise<ResponseEntityListFieldMeta['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form/data-init/protocol/fieldMeta`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 协议列表
 * import { getOnlineFormDataInitProtocolList } from "/@/apis/gct-apaas/OnlineFormDataInitController"
 */
export async function getOnlineFormDataInitProtocolList(config = {}): Promise<ResponseEntityListOnlineFormDataInitProtocolDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/online-form/data-init/protocol/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}