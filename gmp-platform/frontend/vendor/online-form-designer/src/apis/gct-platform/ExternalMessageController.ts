import { defHttp } from '@/utils/http/axios';
import { ExternalMessageRequest, ResponseEntitystring, ResponseEntityExternalMessageResponse, ResponseEntityListExternalMessageResponse, ResponseEntityPageBaseExternalMessageResponse } from './model/index';

/**
 * 保存
 * import { postExternalMessage } from "/@/apis/gct-platform/ExternalMessageController"
 */
export async function postExternalMessage(data: ExternalMessageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/external-message`,
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
 * import { deleteExternalMessage } from "/@/apis/gct-platform/ExternalMessageController"
 */
export interface deleteExternalMessageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteExternalMessage(params: deleteExternalMessageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/external-message`,
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
 * import { getExternalMessageInfo } from "/@/apis/gct-platform/ExternalMessageController"
 */
export interface getExternalMessageInfoQueryInterface {
  id: string; // id
}
export async function getExternalMessageInfo(params: getExternalMessageInfoQueryInterface = {}, config = {}): Promise<ResponseEntityExternalMessageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/external-message/info`,
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
 * import { getExternalMessageList } from "/@/apis/gct-platform/ExternalMessageController"
 */
export async function getExternalMessageList(config = {}): Promise<ResponseEntityListExternalMessageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/external-message/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getExternalMessagePageList } from "/@/apis/gct-platform/ExternalMessageController"
 */
export interface getExternalMessagePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getExternalMessagePageList(params: getExternalMessagePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseExternalMessageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/external-message/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putExternalMessageById } from "/@/apis/gct-platform/ExternalMessageController"
 */
export interface putExternalMessageByIdPathInterface {
  id: string; // id
}
export async function putExternalMessageById(path: putExternalMessageByIdPathInterface, data: ExternalMessageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/external-message/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}