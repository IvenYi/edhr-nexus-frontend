import { defHttp } from '@/utils/http/axios';
import { WorkbenchComponentRelationRequest, ResponseEntitystring, WorkbenchComponentRelationDragRequest, ResponseEntityWorkbenchComponentRelationResponse, ResponseEntityListWorkbenchComponentRelationResponse, ResponseEntityPageBaseWorkbenchComponentRelationResponse, WorkbenchComponentRelationBatchRequest } from './model/index';

/**
 * 保存
 * import { postWorkbenchComponentRelation } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export async function postWorkbenchComponentRelation(data: WorkbenchComponentRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/workbench-component-relation`,
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
 * import { deleteWorkbenchComponentRelation } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface deleteWorkbenchComponentRelationQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteWorkbenchComponentRelation(params: deleteWorkbenchComponentRelationQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/workbench-component-relation`,
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
 * 拖拽
 * import { postWorkbenchComponentRelationDrag } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export async function postWorkbenchComponentRelationDrag(data: WorkbenchComponentRelationDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/workbench-component-relation/drag`,
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
 * import { getWorkbenchComponentRelationInfo } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface getWorkbenchComponentRelationInfoQueryInterface {
  id: string; // id
}
export async function getWorkbenchComponentRelationInfo(params: getWorkbenchComponentRelationInfoQueryInterface = {}, config = {}): Promise<ResponseEntityWorkbenchComponentRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/workbench-component-relation/info`,
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
 * import { getWorkbenchComponentRelationList } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface getWorkbenchComponentRelationListQueryInterface {
  enabled: boolean; // enabled
}
export async function getWorkbenchComponentRelationList(params: getWorkbenchComponentRelationListQueryInterface = {}, config = {}): Promise<ResponseEntityListWorkbenchComponentRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/workbench-component-relation/list`,
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
 * import { getWorkbenchComponentRelationPageList } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface getWorkbenchComponentRelationPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getWorkbenchComponentRelationPageList(params: getWorkbenchComponentRelationPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseWorkbenchComponentRelationResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/workbench-component-relation/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改位置信息
 * import { putWorkbenchComponentRelationUpdatePositionJson } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export async function putWorkbenchComponentRelationUpdatePositionJson(data: WorkbenchComponentRelationBatchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/workbench-component-relation/updatePositionJson`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 开启&关闭
 * import { putWorkbenchComponentRelationWorkbenchComponentActiveById } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface putWorkbenchComponentRelationWorkbenchComponentActiveByIdPathInterface {
  id: string; // id
}
export interface putWorkbenchComponentRelationWorkbenchComponentActiveByIdQueryInterface {
  enabled: number; // enabled
}
export async function putWorkbenchComponentRelationWorkbenchComponentActiveById(path: putWorkbenchComponentRelationWorkbenchComponentActiveByIdPathInterface, params: putWorkbenchComponentRelationWorkbenchComponentActiveByIdQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/workbench-component-relation/workbenchComponentActive/${path?.id}`,
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
 * import { putWorkbenchComponentRelationById } from "/@/apis/gct-platform/WorkbenchComponentRelationController"
 */
export interface putWorkbenchComponentRelationByIdPathInterface {
  id: string; // id
}
export async function putWorkbenchComponentRelationById(path: putWorkbenchComponentRelationByIdPathInterface, data: WorkbenchComponentRelationRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/workbench-component-relation/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}