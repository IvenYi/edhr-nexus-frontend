import { defHttp } from '@/utils/http/axios';
import { ControlConfigRequest, ResponseEntitystring, ResponseEntityListDocControlCategoryCompleteVO, ResponseEntityControlConfigResponse, ResponseEntityListControlConfigResponse, ResponseEntityPageBaseControlConfigResponse } from './model/index';

/**
 * 保存或更新
 * import { postControlConfig } from "/@/apis/gct-apaas/ControlConfigController"
 */
export async function postControlConfig(data: ControlConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/control-config`,
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
 * import { deleteControlConfig } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface deleteControlConfigQueryInterface {
  ids: string; // 删除的refId，多个按','分割
}
export async function deleteControlConfig(params: deleteControlConfigQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/control-config`,
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
 * 在线表单/eDHR 受控配置分类树
 * import { getControlConfigCategoryList } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigCategoryListQueryInterface {
  moduleType: string; // moduleType
}
export async function getControlConfigCategoryList(params: getControlConfigCategoryListQueryInterface = {}, config = {}): Promise<ResponseEntityListDocControlCategoryCompleteVO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/control-config/category/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getControlConfigInfo } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigInfoQueryInterface {
  id: string; // id
}
export async function getControlConfigInfo(params: getControlConfigInfoQueryInterface = {}, config = {}): Promise<ResponseEntityControlConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/control-config/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getControlConfigInfoByTypeByRefId } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigInfoByTypeByRefIdPathInterface {
  refId: string; // refId
  type: string; // type
}
export async function getControlConfigInfoByTypeByRefId(path: getControlConfigInfoByTypeByRefIdPathInterface, config = {}): Promise<ResponseEntityControlConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/control-config/info/${path?.type}/${path?.refId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getControlConfigList } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigListQueryInterface {
  type: string; // 单据分类:ONLINE_FORM_CATEGORY/eDHR分类:EDHR_CATEGORY/特殊表单:ONLINE_FORM_CFG/特殊eDHR:EDHR_CFG
}
export async function getControlConfigList(params: getControlConfigListQueryInterface = {}, config = {}): Promise<ResponseEntityListControlConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/control-config/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 特殊分类配置分页列表
 * import { getControlConfigSpecialPageList } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface getControlConfigSpecialPageListQueryInterface {
  code?: string; // 表单编码
  name?: string; // 表单名称
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  type: string; // 特殊表单:ONLINE_FORM_CFG/特殊eDHR:EDHR_CFG
  version?: string; // 表单版本搜索
}
export async function getControlConfigSpecialPageList(params: getControlConfigSpecialPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseControlConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/control-config/special/page/list`,
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
 * import { putControlConfigById } from "/@/apis/gct-apaas/ControlConfigController"
 */
export interface putControlConfigByIdPathInterface {
  id: string; // id
}
export async function putControlConfigById(path: putControlConfigByIdPathInterface, data: ControlConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/control-config/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}