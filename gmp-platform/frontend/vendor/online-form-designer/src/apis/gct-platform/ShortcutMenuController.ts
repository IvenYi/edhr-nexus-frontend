import { defHttp } from '@/utils/http/axios';
import { ShortcutMenuRequest, ResponseEntitystring, ResponseEntityShortcutMenuDtoResponse, ResponseEntityListShortcutMenuDtoResponse, ResponseEntityobject, ResponseEntityPageBaseShortcutMenuResponse } from './model/index';

/**
 * 保存
 * import { postShortcutMenu } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export async function postShortcutMenu(data: ShortcutMenuRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/shortcut/menu`,
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
 * import { deleteShortcutMenu } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface deleteShortcutMenuQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteShortcutMenu(params: deleteShortcutMenuQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/shortcut/menu`,
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
 * import { getShortcutMenuInfo } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface getShortcutMenuInfoQueryInterface {
  id: string; // id
}
export async function getShortcutMenuInfo(params: getShortcutMenuInfoQueryInterface = {}, config = {}): Promise<ResponseEntityShortcutMenuDtoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/shortcut/menu/info`,
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
 * import { getShortcutMenuList } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export async function getShortcutMenuList(config = {}): Promise<ResponseEntityListShortcutMenuDtoResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/shortcut/menu/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取应用菜单列表
 * import { getShortcutMenuListAPpMenu } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface getShortcutMenuListAPpMenuQueryInterface {
  appId: string; // appId
  terminalType: string; // terminalType
}
export async function getShortcutMenuListAPpMenu(params: getShortcutMenuListAPpMenuQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/shortcut/menu/list/AppMenu`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getShortcutMenuPageList } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface getShortcutMenuPageListQueryInterface {
  appId?: string; // 应用id
  endTime?: string; // 结束时间
  env?: string; // ...
  menuId?: string; // 菜单id
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  terminalType?: string; // 快捷菜单类型（WEB/MOBILE）
}
export async function getShortcutMenuPageList(params: getShortcutMenuPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseShortcutMenuResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/shortcut/menu/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量保存
 * import { postShortcutMenuSaveBatch } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export async function postShortcutMenuSaveBatch(data: ShortcutMenuRequest[], config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/shortcut/menu/saveBatch`,
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
 * import { putShortcutMenuById } from "/@/apis/gct-platform/ShortcutMenuController"
 */
export interface putShortcutMenuByIdPathInterface {
  id: string; // id
}
export async function putShortcutMenuById(path: putShortcutMenuByIdPathInterface, data: ShortcutMenuRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/shortcut/menu/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}