import request from '@mobile/utils/request';
import type { DifyDocRequest, ResponseEntitystring, DifyChatRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 同步知识库
 * import { postDifyChatAsyncDocument } from "/@/apis/gct-apaas/DifyChatController"
 */
export async function postDifyChatAsyncDocument(data: DifyDocRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dify-chat/asyncDocument`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 会话
 * import { postDifyChatChat } from "/@/apis/gct-apaas/DifyChatController"
 */
export async function postDifyChatChat(data: DifyChatRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/dify-chat/chat`,
      method: 'post',
      data,
      ...config,
    },
  );
}