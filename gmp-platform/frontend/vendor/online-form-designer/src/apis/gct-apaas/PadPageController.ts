import { defHttp } from '@/utils/http/axios';
import { PadPageRequest, ResponseEntitystring, ResponseEntityPadPageResponse, ResponseEntityListPadPageResponse, ResponseEntityPageBasePadPageResponse, WebpageDesignerJsonRequest } from './model/index';

/**
 * 保存
 * import { postPadPage } from "/@/apis/gct-apaas/PadPageController"
 */
export async function postPadPage(data: PadPageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pad-page`,
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
 * import { deletePadPage } from "/@/apis/gct-apaas/PadPageController"
 */
export interface deletePadPageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePadPage(params: deletePadPageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/pad-page`,
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
 * import { postPadPageCopyByIdById } from "/@/apis/gct-apaas/PadPageController"
 */
export interface postPadPageCopyByIdByIdPathInterface {
  id: string; // 原页面Id
}
export async function postPadPageCopyByIdById(path: postPadPageCopyByIdByIdPathInterface, data: PadPageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/pad-page/copyById/${path?.id}`,
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
 * import { getPadPageInfo } from "/@/apis/gct-apaas/PadPageController"
 */
export interface getPadPageInfoQueryInterface {
  id: string; // id
  type?: number; // type
}
export async function getPadPageInfo(params: getPadPageInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPadPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pad-page/info`,
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
 * import { getPadPageList } from "/@/apis/gct-apaas/PadPageController"
 */
export async function getPadPageList(config = {}): Promise<ResponseEntityListPadPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pad-page/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPadPagePageList } from "/@/apis/gct-apaas/PadPageController"
 */
export interface getPadPagePageListQueryInterface {
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
export async function getPadPagePageList(params: getPadPagePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePadPageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/pad-page/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改页面设计Json
 * import { putPadPageUpdateDesignerJsonById } from "/@/apis/gct-apaas/PadPageController"
 */
export interface putPadPageUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putPadPageUpdateDesignerJsonById(path: putPadPageUpdateDesignerJsonByIdPathInterface, data: WebpageDesignerJsonRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/pad-page/updateDesignerJson/${path?.id}`,
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
 * import { putPadPageById } from "/@/apis/gct-apaas/PadPageController"
 */
export interface putPadPageByIdPathInterface {
  id: string; // id
}
export async function putPadPageById(path: putPadPageByIdPathInterface, data: PadPageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/pad-page/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}