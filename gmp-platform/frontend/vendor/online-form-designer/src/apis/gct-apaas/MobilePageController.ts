import { defHttp } from '@/utils/http/axios';
import { MobilePageRequest, ResponseEntitystring, WebpageRequest, ResponseEntityMobilePageResponse, ResponseEntityListMobilePageResponse, ResponseEntityPageBaseMobilePageResponse, WebpageDesignerJsonRequest } from './model/index';

/**
 * 保存
 * import { postMobilePage } from "/@/apis/gct-apaas/MobilePageController"
 */
export async function postMobilePage(data: MobilePageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/mobile-page`,
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
 * import { deleteMobilePage } from "/@/apis/gct-apaas/MobilePageController"
 */
export interface deleteMobilePageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMobilePage(params: deleteMobilePageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/mobile-page`,
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
 * 复制页面
 * import { postMobilePageCopyByIdById } from "/@/apis/gct-apaas/MobilePageController"
 */
export interface postMobilePageCopyByIdByIdPathInterface {
  id: string; // 原页面Id
}
export async function postMobilePageCopyByIdById(path: postMobilePageCopyByIdByIdPathInterface, data: WebpageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/mobile-page/copyById/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getMobilePageInfo } from "/@/apis/gct-apaas/MobilePageController"
 */
export interface getMobilePageInfoQueryInterface {
  id: string; // id
  type?: number; // type
}
export async function getMobilePageInfo(params: getMobilePageInfoQueryInterface = {}, config = {}): Promise<ResponseEntityMobilePageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/mobile-page/info`,
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
 * import { getMobilePageList } from "/@/apis/gct-apaas/MobilePageController"
 */
export async function getMobilePageList(config = {}): Promise<ResponseEntityListMobilePageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/mobile-page/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMobilePagePageList } from "/@/apis/gct-apaas/MobilePageController"
 */
export interface getMobilePagePageListQueryInterface {
  description?: string; // 页面描述
  endTime?: string; // 结束时间
  id?: string; // 主键id
  key?: string; // 页面key
  name?: string; // 页面名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getMobilePagePageList(params: getMobilePagePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseMobilePageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/mobile-page/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改webPage页面设计Json
 * import { putMobilePageUpdateDesignerJsonById } from "/@/apis/gct-apaas/MobilePageController"
 */
export interface putMobilePageUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putMobilePageUpdateDesignerJsonById(path: putMobilePageUpdateDesignerJsonByIdPathInterface, data: WebpageDesignerJsonRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/mobile-page/updateDesignerJson/${path?.id}`,
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
 * import { putMobilePageById } from "/@/apis/gct-apaas/MobilePageController"
 */
export interface putMobilePageByIdPathInterface {
  id: string; // id
}
export async function putMobilePageById(path: putMobilePageByIdPathInterface, data: MobilePageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/mobile-page/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}