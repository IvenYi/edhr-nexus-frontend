import request from '@mobile/utils/request';
import type { TransferAllWorkItemRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 生产环境转移所有工作项（待填报、待审核等）
 * import { postEdhrProdTransferAllWorkItem } from "/@/apis/gct-apaas/EdhrSuiteExternalController"
 */
export async function postEdhrProdTransferAllWorkItem(data: TransferAllWorkItemRequest, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/external/api/edhr/prod/transferAllWorkItem`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 测试环境转移所有工作项（待填报、待审核等）
 * import { postEdhrTestTransferAllWorkItem } from "/@/apis/gct-apaas/EdhrSuiteExternalController"
 */
export async function postEdhrTestTransferAllWorkItem(data: TransferAllWorkItemRequest, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-apaas/external/api/edhr/test/transferAllWorkItem`,
      method: 'post',
      data,
      ...config,
    },
  );
}