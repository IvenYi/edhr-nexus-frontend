import { defHttp } from '@/utils/http/axios';
import { WebpageRequest, ResponseEntitystring, WebPageLockRequest, ResponseEntityWebPageOccupyResponse, ResponseEntityWebpageResponse, ResponseEntityListWebpageResponse, ResponseEntityPageBaseWebpageResponse, WebpageDesignerJsonRequest } from './model/index';

/**
 * 保存
 * import { postWebpage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpage(data: WebpageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/webpage`,
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
 * import { deleteWebpage } from "/@/apis/gct-apaas/WebpageController"
 */
export interface deleteWebpageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteWebpage(params: deleteWebpageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/webpage`,
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
 * 取消webPage页面占用
 * import { postWebpageCancelOccupyWebPage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageCancelOccupyWebPage(data: WebPageLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/webpage/cancelOccupyWebPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 复制页面
 * import { postWebpageCopyByIdById } from "/@/apis/gct-apaas/WebpageController"
 */
export interface postWebpageCopyByIdByIdPathInterface {
  id: string; // 原页面Id
}
export async function postWebpageCopyByIdById(path: postWebpageCopyByIdByIdPathInterface, data: WebpageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/webpage/copyById/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取webPage页面占用信息
 * import { postWebpageGetWebPageOccupyMsg } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageGetWebPageOccupyMsg(data: WebPageLockRequest, config = {}): Promise<ResponseEntityWebPageOccupyResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/webpage/getWebPageOccupyMsg`,
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
 * import { getWebpageInfo } from "/@/apis/gct-apaas/WebpageController"
 */
export interface getWebpageInfoQueryInterface {
  id: string; // id
  type?: number; // type
}
export async function getWebpageInfo(params: getWebpageInfoQueryInterface = {}, config = {}): Promise<ResponseEntityWebpageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/webpage/info`,
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
 * import { getWebpageList } from "/@/apis/gct-apaas/WebpageController"
 */
export async function getWebpageList(config = {}): Promise<ResponseEntityListWebpageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/webpage/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 锁定webPage页面
 * import { postWebpageLockWebPage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageLockWebPage(data: WebPageLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/webpage/lockWebPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 占用webPage页面进行编辑
 * import { postWebpageOccupyWebPage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageOccupyWebPage(data: WebPageLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/webpage/occupyWebPage`,
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
 * import { getWebpagePageList } from "/@/apis/gct-apaas/WebpageController"
 */
export interface getWebpagePageListQueryInterface {
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
export async function getWebpagePageList(params: getWebpagePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseWebpageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/webpage/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 解除锁定webPage页面
 * import { postWebpageUnLockWebPage } from "/@/apis/gct-apaas/WebpageController"
 */
export async function postWebpageUnLockWebPage(data: WebPageLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/webpage/unLockWebPage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改webPage页面设计Json
 * import { putWebpageUpdateDesignerJsonById } from "/@/apis/gct-apaas/WebpageController"
 */
export interface putWebpageUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putWebpageUpdateDesignerJsonById(path: putWebpageUpdateDesignerJsonByIdPathInterface, data: WebpageDesignerJsonRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/webpage/updateDesignerJson/${path?.id}`,
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
 * import { putWebpageById } from "/@/apis/gct-apaas/WebpageController"
 */
export interface putWebpageByIdPathInterface {
  id: string; // id
}
export async function putWebpageById(path: putWebpageByIdPathInterface, data: WebpageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/webpage/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}