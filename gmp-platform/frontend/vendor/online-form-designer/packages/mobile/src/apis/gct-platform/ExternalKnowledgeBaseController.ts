import request from '@mobile/utils/request';
import type { ResponseEntityListKnowledgeBaseDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 获取知识库详情
 * import { getKnowledgeBaseFindByIds } from "/@/apis/gct-platform/ExternalKnowledgeBaseController"
 */
export interface getKnowledgeBaseFindByIdsQueryInterface {
  ids: string; // ids
}
export async function getKnowledgeBaseFindByIds(params: getKnowledgeBaseFindByIdsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListKnowledgeBaseDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/knowledge-base/findByIds`,
      method: 'get',
      params,
      ...config,
    },
  );
}