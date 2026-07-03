import { defHttp } from '@/utils/http/axios';
import { TransferAllWorkItemRequest } from './model/index';

/**
 * 生产环境转移所有工作项（待填报、待审核等）
 * import { postEdhrProdTransferAllWorkItemExternal } from "/@/apis/gct-apaas/EdhrSuiteExternalController"
 */
export async function postEdhrProdTransferAllWorkItemExternal(data: TransferAllWorkItemRequest, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/edhr/prod/transferAllWorkItem`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试环境转移所有工作项（待填报、待审核等）
 * import { postEdhrTestTransferAllWorkItemExternal } from "/@/apis/gct-apaas/EdhrSuiteExternalController"
 */
export async function postEdhrTestTransferAllWorkItemExternal(data: TransferAllWorkItemRequest, config = {}): Promise<any> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/edhr/test/transferAllWorkItem`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}