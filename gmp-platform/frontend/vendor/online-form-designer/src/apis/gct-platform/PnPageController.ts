import { defHttp } from '@/utils/http/axios';
import { PnPageRequest, ResponseEntitystring, ResponseEntityPnPageResponse, ResponseEntityListPnPageResponse, ResponseEntityPageBasePnPageResponse } from './model/index';

/**
 * 保存
 * import { postPnPage } from "/@/apis/gct-platform/PnPageController"
 */
export async function postPnPage(data: PnPageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pn-page`,
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
 * import { deletePnPage } from "/@/apis/gct-platform/PnPageController"
 */
export interface deletePnPageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePnPage(params: deletePnPageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/pn-page`,
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
 * import { getPnPageInfo } from "/@/apis/gct-platform/PnPageController"
 */
export interface getPnPageInfoQueryInterface {
  id: string; // id
}
export async function getPnPageInfo(params: getPnPageInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPnPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-page/info`,
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
 * import { getPnPageList } from "/@/apis/gct-platform/PnPageController"
 */
export async function getPnPageList(config = {}): Promise<ResponseEntityListPnPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-page/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPnPagePageList } from "/@/apis/gct-platform/PnPageController"
 */
export interface getPnPagePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPnPagePageList(params: getPnPagePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePnPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pn-page/page/list`,
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
 * import { putPnPageById } from "/@/apis/gct-platform/PnPageController"
 */
export interface putPnPageByIdPathInterface {
  id: string; // id
}
export async function putPnPageById(path: putPnPageByIdPathInterface, data: PnPageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/pn-page/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}