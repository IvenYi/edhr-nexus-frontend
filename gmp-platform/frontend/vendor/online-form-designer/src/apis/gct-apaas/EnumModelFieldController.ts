import { defHttp } from '@/utils/http/axios';
import { EnumModelFieldRequest, ResponseEntitystring, EnumModelFieldDragRequest, ResponseEntityEnumModelFieldResponse, ResponseEntityListEnumModelFieldResponse, ResponseEntityPageBaseEnumModelFieldResponse, EnumModelFieldSortReq } from './model/index';

/**
 * 保存
 * import { postEnumModelField } from "/@/apis/gct-apaas/EnumModelFieldController"
 */
export async function postEnumModelField(data: EnumModelFieldRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/enum-model-field`,
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
 * import { deleteEnumModelField } from "/@/apis/gct-apaas/EnumModelFieldController"
 */
export interface deleteEnumModelFieldQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEnumModelField(params: deleteEnumModelFieldQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/enum-model-field`,
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
 * import { postEnumModelFieldDrag } from "/@/apis/gct-apaas/EnumModelFieldController"
 */
export async function postEnumModelFieldDrag(data: EnumModelFieldDragRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/enum-model-field/drag`,
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
 * import { getEnumModelFieldInfoById } from "/@/apis/gct-apaas/EnumModelFieldController"
 */
export interface getEnumModelFieldInfoByIdPathInterface {
  id: string; // id
}
export async function getEnumModelFieldInfoById(path: getEnumModelFieldInfoByIdPathInterface, config = {}): Promise<ResponseEntityEnumModelFieldResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/enum-model-field/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getEnumModelFieldList } from "/@/apis/gct-apaas/EnumModelFieldController"
 */
export async function getEnumModelFieldList(config = {}): Promise<ResponseEntityListEnumModelFieldResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/enum-model-field/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEnumModelFieldPageList } from "/@/apis/gct-apaas/EnumModelFieldController"
 */
export interface getEnumModelFieldPageListQueryInterface {
  endTime?: string; // 结束时间
  enumModelId?: string; // 枚举模型id
  enumModelKey?: string; // 枚举模型Key
  id?: string; // 枚举字段id
  pageNo?: number; // 页码
  pageSize?: number; // 一页条数，覆盖父类默认值
  searchKey?: string; // 枚举文本/枚举值
  sortField?: string; // 排序字段
  sortNum?: number; // 排序
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  text?: string; // 枚举文本
  value?: string; // 枚举值
}
export async function getEnumModelFieldPageList(params: getEnumModelFieldPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseEnumModelFieldResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/enum-model-field/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 拖拽排序
 * import { postEnumModelFieldSort } from "/@/apis/gct-apaas/EnumModelFieldController"
 */
export async function postEnumModelFieldSort(data: EnumModelFieldSortReq, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/enum-model-field/sort`,
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
 * import { putEnumModelFieldById } from "/@/apis/gct-apaas/EnumModelFieldController"
 */
export interface putEnumModelFieldByIdPathInterface {
  id: string; // id
}
export async function putEnumModelFieldById(path: putEnumModelFieldByIdPathInterface, data: EnumModelFieldRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/enum-model-field/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}