import { defHttp } from '@/utils/http/axios';
import { CommonInfoCardRequest, ResponseEntitystring, ResponseEntityCommonInfoCardResponse, ResponseEntityListCommonInfoCardResponse, ResponseEntityPageBaseCommonInfoCardResponse } from './model/index';

/**
 * 保存
 * import { postCommonInfoCard } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export async function postCommonInfoCard(data: CommonInfoCardRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/common-info-card`,
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
 * import { deleteCommonInfoCard } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export interface deleteCommonInfoCardQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCommonInfoCard(params: deleteCommonInfoCardQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/common-info-card`,
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
 * 查找信息卡
 * import { getCommonInfoCardGetById } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export interface getCommonInfoCardGetByIdQueryInterface {
  id: string; // id
  modelKey: string; // modelKey
  type: string; // type
}
export async function getCommonInfoCardGetById(params: getCommonInfoCardGetByIdQueryInterface = {}, config = {}): Promise<ResponseEntityCommonInfoCardResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/common-info-card/getById`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getCommonInfoCardInfo } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export interface getCommonInfoCardInfoQueryInterface {
  id: string; // id
}
export async function getCommonInfoCardInfo(params: getCommonInfoCardInfoQueryInterface = {}, config = {}): Promise<ResponseEntityCommonInfoCardResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/common-info-card/info`,
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
 * import { postCommonInfoCardList } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export async function postCommonInfoCardList(data: CommonInfoCardRequest, config = {}): Promise<ResponseEntityListCommonInfoCardResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/common-info-card/list`,
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
 * import { postCommonInfoCardPageList } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export async function postCommonInfoCardPageList(data: CommonInfoCardRequest, config = {}): Promise<ResponseEntityPageBaseCommonInfoCardResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/common-info-card/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 名称修改
 * import { postCommonInfoCardUpdateName } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export async function postCommonInfoCardUpdateName(data: CommonInfoCardRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/common-info-card/updateName`,
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
 * import { putCommonInfoCardById } from "/@/apis/gct-apaas/CommonInfoCardController"
 */
export interface putCommonInfoCardByIdPathInterface {
  id: string; // id
}
export async function putCommonInfoCardById(path: putCommonInfoCardByIdPathInterface, data: CommonInfoCardRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/common-info-card/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}