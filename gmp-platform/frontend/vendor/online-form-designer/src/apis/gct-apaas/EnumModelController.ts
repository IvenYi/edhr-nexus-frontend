import { defHttp } from '@/utils/http/axios';
import { EnumModelRequest, ResponseEntitystring, ResponseEntityEnumModelResponse, ResponseEntityListEnumModelResponse, ResponseEntityPageBaseEnumModelResponse, EnumModelSubmitRequest, EnumModelState } from './model/index';

/**
 * 保存
 * import { postEnumModel } from "/@/apis/gct-apaas/EnumModelController"
 */
export async function postEnumModel(data: EnumModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/enum-model`,
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
 * import { deleteEnumModel } from "/@/apis/gct-apaas/EnumModelController"
 */
export interface deleteEnumModelQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteEnumModel(params: deleteEnumModelQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/enum-model`,
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
 * import { getEnumModelInfoById } from "/@/apis/gct-apaas/EnumModelController"
 */
export interface getEnumModelInfoByIdPathInterface {
  id: string; // id
}
export async function getEnumModelInfoById(path: getEnumModelInfoByIdPathInterface, config = {}): Promise<ResponseEntityEnumModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/enum-model/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getEnumModelList } from "/@/apis/gct-apaas/EnumModelController"
 */
export async function getEnumModelList(config = {}): Promise<ResponseEntityListEnumModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/enum-model/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getEnumModelPageList } from "/@/apis/gct-apaas/EnumModelController"
 */
export interface getEnumModelPageListQueryInterface {
  code?: string; // 编码
  description?: string; // 枚举模型描述
  endTime?: string; // 结束时间
  key?: string; // 枚举模型key
  name?: string; // 枚举模型名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getEnumModelPageList(params: getEnumModelPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseEnumModelResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/enum-model/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 带字段整体提交（不带id：新增；带id：更新）,前台字典功能使用
 * import { postEnumModelSubmitWithFields } from "/@/apis/gct-apaas/EnumModelController"
 */
export async function postEnumModelSubmitWithFields(data: EnumModelSubmitRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/enum-model/submitWithFields`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改枚举图标启用禁用状态
 * import { putEnumModelUpdateIconStateById } from "/@/apis/gct-apaas/EnumModelController"
 */
export interface putEnumModelUpdateIconStateByIdPathInterface {
  id: string; // id
}
export async function putEnumModelUpdateIconStateById(path: putEnumModelUpdateIconStateByIdPathInterface, data: EnumModelState, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/enum-model/updateIconState/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改枚举字段颜色启用禁用状态
 * import { putEnumModelUpdateTextStateById } from "/@/apis/gct-apaas/EnumModelController"
 */
export interface putEnumModelUpdateTextStateByIdPathInterface {
  id: string; // id
}
export async function putEnumModelUpdateTextStateById(path: putEnumModelUpdateTextStateByIdPathInterface, data: EnumModelState, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/enum-model/updateTextState/${path?.id}`,
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
 * import { putEnumModelById } from "/@/apis/gct-apaas/EnumModelController"
 */
export interface putEnumModelByIdPathInterface {
  id: string; // id
}
export async function putEnumModelById(path: putEnumModelByIdPathInterface, data: EnumModelRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/enum-model/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}