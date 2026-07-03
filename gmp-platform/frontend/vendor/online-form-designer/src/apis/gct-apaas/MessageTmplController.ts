import { defHttp } from '@/utils/http/axios';
import { MessageTmplRequest, ResponseEntitystring, ResponseEntityListMessageTmplResponse, MessageTmplOpenedRequest, ResponseEntityPageBaseMessageTmplResponse, MessageTmplSendRequest } from './model/index';

/**
 * 保存
 * import { postMessageTmpl } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function postMessageTmpl(data: MessageTmplRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/message-tmpl`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteMessageTmpl } from "/@/apis/gct-apaas/MessageTmplController"
 */
export interface deleteMessageTmplQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMessageTmpl(params: deleteMessageTmplQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/message-tmpl`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      joinParamsToUrl: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getMessageTmplList } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function getMessageTmplList(config = {}): Promise<ResponseEntityListMessageTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/message-tmpl/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 通过模型key筛选消息模板
 * import { getMessageTmplListByModelKey } from "/@/apis/gct-apaas/MessageTmplController"
 */
export interface getMessageTmplListByModelKeyQueryInterface {
  modelKey: string; // modelKey
}
export async function getMessageTmplListByModelKey(params: getMessageTmplListByModelKeyQueryInterface = {}, config = {}): Promise<ResponseEntityListMessageTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/message-tmpl/listByModelKey`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 公开和不公开
 * import { putMessageTmplOpened } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function putMessageTmplOpened(data: MessageTmplOpenedRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/message-tmpl/opened`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMessageTmplPageList } from "/@/apis/gct-apaas/MessageTmplController"
 */
export interface getMessageTmplPageListQueryInterface {
  key?: string; // key
  modelName?: string; // modelName
  name?: string; // name
  opened?: number; // opened
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  type?: string; // type
}
export async function getMessageTmplPageList(params: getMessageTmplPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseMessageTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/message-tmpl/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 审核流程发送消息
 * import { postMessageTmplProcessSend } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function postMessageTmplProcessSend(data: MessageTmplSendRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/message-tmpl/processSend`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试发送消息
 * import { postMessageTmplSend } from "/@/apis/gct-apaas/MessageTmplController"
 */
export async function postMessageTmplSend(data: MessageTmplSendRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/message-tmpl/send`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putMessageTmplById } from "/@/apis/gct-apaas/MessageTmplController"
 */
export interface putMessageTmplByIdPathInterface {
  id: string; // id
}
export async function putMessageTmplById(path: putMessageTmplByIdPathInterface, data: MessageTmplRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/message-tmpl/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}