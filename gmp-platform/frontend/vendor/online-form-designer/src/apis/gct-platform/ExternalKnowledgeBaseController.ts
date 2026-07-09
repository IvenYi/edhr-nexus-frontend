import { defHttp } from '@/utils/http/axios';
import { ResponseEntityListKnowledgeBaseDTO } from './model/index';

/**
 * 获取知识库详情
 * import { getKnowledgeBaseFindByIdsExternal } from "/@/apis/gct-platform/ExternalKnowledgeBaseController"
 */
export interface getKnowledgeBaseFindByIdsExternalQueryInterface {
  ids: string; // ids
}
export async function getKnowledgeBaseFindByIdsExternal(params: getKnowledgeBaseFindByIdsExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListKnowledgeBaseDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/knowledge-base/findByIds`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}