import { defHttp } from '@/utils/http/axios';
import { NavMenuRequest, ResponseEntitystring, ResponseEntityNavMenuResponse, ResponseEntityListNavMenuResponse, ResponseEntityPageBaseNavMenuResponse, SingleRequest } from './model/index';

/**
 * 保存
 * import { postNavMenu } from "/@/apis/gct-platform/NavMenuController"
 */
export async function postNavMenu(data: NavMenuRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/nav-menu`,
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
 * import { deleteNavMenu } from "/@/apis/gct-platform/NavMenuController"
 */
export interface deleteNavMenuQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteNavMenu(params: deleteNavMenuQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/nav-menu`,
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
 * import { getNavMenuGetSelected } from "/@/apis/gct-platform/NavMenuController"
 */
export async function getNavMenuGetSelected(config = {}): Promise<ResponseEntityNavMenuResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/nav-menu/getSelected`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getNavMenuInfo } from "/@/apis/gct-platform/NavMenuController"
 */
export interface getNavMenuInfoQueryInterface {
  id: string; // id
}
export async function getNavMenuInfo(params: getNavMenuInfoQueryInterface = {}, config = {}): Promise<ResponseEntityNavMenuResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/nav-menu/info`,
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
 * import { getNavMenuList } from "/@/apis/gct-platform/NavMenuController"
 */
export async function getNavMenuList(config = {}): Promise<ResponseEntityListNavMenuResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/nav-menu/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getNavMenuPageList } from "/@/apis/gct-platform/NavMenuController"
 */
export interface getNavMenuPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getNavMenuPageList(params: getNavMenuPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseNavMenuResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/nav-menu/page/list`,
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
 * import { postNavMenuSelect } from "/@/apis/gct-platform/NavMenuController"
 */
export async function postNavMenuSelect(data: SingleRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/nav-menu/select`,
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
 * import { putNavMenuUpdateDesignerJsonById } from "/@/apis/gct-platform/NavMenuController"
 */
export interface putNavMenuUpdateDesignerJsonByIdPathInterface {
  id: string; // id
}
export async function putNavMenuUpdateDesignerJsonById(path: putNavMenuUpdateDesignerJsonByIdPathInterface, data: NavMenuRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/nav-menu/updateDesignerJson/${path?.id}`,
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
 * import { putNavMenuById } from "/@/apis/gct-platform/NavMenuController"
 */
export interface putNavMenuByIdPathInterface {
  id: string; // id
}
export async function putNavMenuById(path: putNavMenuByIdPathInterface, data: NavMenuRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/nav-menu/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}