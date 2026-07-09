import { defHttp } from '@/utils/http/axios';
import { WorkbenchComponentRequest, ResponseEntitystring, ResponseEntityWorkbenchComponentResponse, ResponseEntityListWorkbenchComponentResponse, ResponseEntityPageBaseWorkbenchComponentResponse } from './model/index';

/**
 * 保存
 * import { postWorkbenchComponent } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export async function postWorkbenchComponent(data: WorkbenchComponentRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/workbench-component`,
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
 * import { deleteWorkbenchComponent } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface deleteWorkbenchComponentQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteWorkbenchComponent(params: deleteWorkbenchComponentQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/workbench-component`,
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
 * import { getWorkbenchComponentInfo } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface getWorkbenchComponentInfoQueryInterface {
  id: string; // id
}
export async function getWorkbenchComponentInfo(params: getWorkbenchComponentInfoQueryInterface = {}, config = {}): Promise<ResponseEntityWorkbenchComponentResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/workbench-component/info`,
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
 * import { getWorkbenchComponentList } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface getWorkbenchComponentListQueryInterface {
  terminalType?: string; // ...
  type?: string; // ...
}
export async function getWorkbenchComponentList(params: getWorkbenchComponentListQueryInterface = {}, config = {}): Promise<ResponseEntityListWorkbenchComponentResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/workbench-component/list`,
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
 * import { getWorkbenchComponentPageList } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface getWorkbenchComponentPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getWorkbenchComponentPageList(params: getWorkbenchComponentPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseWorkbenchComponentResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/workbench-component/page/list`,
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
 * import { putWorkbenchComponentById } from "/@/apis/gct-platform/WorkbenchComponentController"
 */
export interface putWorkbenchComponentByIdPathInterface {
  id: string; // id
}
export async function putWorkbenchComponentById(path: putWorkbenchComponentByIdPathInterface, data: WorkbenchComponentRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/workbench-component/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}