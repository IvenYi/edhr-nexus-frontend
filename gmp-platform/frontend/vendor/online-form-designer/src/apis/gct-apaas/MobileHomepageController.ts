import { defHttp } from '@/utils/http/axios';
import { MobileHomepageRequest, ResponseEntitystring, ResponseEntityMobileHomepageResponse, ResponseEntityListMobileHomepageResponse, ResponseEntityPageBaseMobileHomepageResponse, SingleRequest } from './model/index';

/**
 * 保存
 * import { postMobileHomepage } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export async function postMobileHomepage(data: MobileHomepageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/mobile-homepage`,
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
 * import { deleteMobileHomepage } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface deleteMobileHomepageQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteMobileHomepage(params: deleteMobileHomepageQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/mobile-homepage`,
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
 * 查询选中的
 * import { getMobileHomepageGetSelected } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export async function getMobileHomepageGetSelected(config = {}): Promise<ResponseEntityMobileHomepageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/mobile-homepage/getSelected`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getMobileHomepageInfo } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface getMobileHomepageInfoQueryInterface {
  id: string; // id
}
export async function getMobileHomepageInfo(params: getMobileHomepageInfoQueryInterface = {}, config = {}): Promise<ResponseEntityMobileHomepageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/mobile-homepage/info`,
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
 * import { getMobileHomepageList } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export async function getMobileHomepageList(config = {}): Promise<ResponseEntityListMobileHomepageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/mobile-homepage/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getMobileHomepagePageList } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface getMobileHomepagePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getMobileHomepagePageList(params: getMobileHomepagePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseMobileHomepageResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/mobile-homepage/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 选中页面，不传id代表都不选中
 * import { postMobileHomepageSelect } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export async function postMobileHomepageSelect(data: SingleRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/mobile-homepage/select`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改页面设计Json
 * import { putMobileHomepageUpdateDesignerJsonById } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface putMobileHomepageUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putMobileHomepageUpdateDesignerJsonById(path: putMobileHomepageUpdateDesignerJsonByIdPathInterface, data: MobileHomepageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/mobile-homepage/updateDesignerJson/${path?.id}`,
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
 * import { putMobileHomepageById } from "/@/apis/gct-apaas/MobileHomepageController"
 */
export interface putMobileHomepageByIdPathInterface {
  id: string; // id
}
export async function putMobileHomepageById(path: putMobileHomepageByIdPathInterface, data: MobileHomepageRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/mobile-homepage/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}