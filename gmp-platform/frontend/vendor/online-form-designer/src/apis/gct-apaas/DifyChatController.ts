import { defHttp } from '@/utils/http/axios';
import { DifyDocRequest, ResponseEntitystring, DifyChatRequest } from './model/index';

/**
 * 同步知识库
 * import { postDifyChatAsyncDocument } from "/@/apis/gct-apaas/DifyChatController"
 */
export async function postDifyChatAsyncDocument(data: DifyDocRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dify-chat/asyncDocument`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 会话
 * import { postDifyChatChat } from "/@/apis/gct-apaas/DifyChatController"
 */
export async function postDifyChatChat(data: DifyChatRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/dify-chat/chat`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}