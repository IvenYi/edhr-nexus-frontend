import { defHttp } from '@/utils/http/axios';
import { MessageRecordRequest, ResponseEntitystring, ResponseEntityMessageRecordResponse, ResponseEntityListMessageRecordResponse, ResponseEntityPageBaseMessageRecordResponse } from './model/index';

/**
 * 保存
 * import { postMessageRecord } from "/@/apis/gct-apaas/MessageRecordController"
 */
export async function postMessageRecord(data: MessageRecordRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/message-record`,
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
 * import { deleteMessageRecord } from "/@/apis/gct-apaas/MessageRecordController"
 */
export interface deleteMessageRecordQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMessageRecord(params: deleteMessageRecordQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/message-record`,
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
 * 详情
 * import { getMessageRecordInfo } from "/@/apis/gct-apaas/MessageRecordController"
 */
export interface getMessageRecordInfoQueryInterface {
  id: string; // id
}
export async function getMessageRecordInfo(params: getMessageRecordInfoQueryInterface = {}, config = {}): Promise<ResponseEntityMessageRecordResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/message-record/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getMessageRecordList } from "/@/apis/gct-apaas/MessageRecordController"
 */
export async function getMessageRecordList(config = {}): Promise<ResponseEntityListMessageRecordResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/message-record/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMessageRecordPageList } from "/@/apis/gct-apaas/MessageRecordController"
 */
export interface getMessageRecordPageListQueryInterface {
  endTime?: string; // endTime
  formSerialNo?: string; // formSerialNo
  modelName?: string; // modelName
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  pushType?: string; // pushType
  result?: string; // result
  startTime?: string; // startTime
  tmplKey?: string; // tmplKey
  tmplName?: string; // tmplName
  userId?: string; // userId
  userName?: string; // userName
}
export async function getMessageRecordPageList(params: getMessageRecordPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseMessageRecordResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/message-record/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}