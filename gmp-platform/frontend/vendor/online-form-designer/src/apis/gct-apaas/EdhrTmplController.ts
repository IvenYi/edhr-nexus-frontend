import { defHttp } from '@/utils/http/axios';
import { OfProcessControlRequest, ResponseEntitystring, EdhrTmplCommonRequest, ResponseEntityEdhrTmplResponse, ResponseEntityListEdhrTmplResponse, ResponseEntityboolean, OperatingStateRequest, EdhrTmplRequest } from './model/index';

/**
 * eDHR发起受控
 * import { postEdhrTmplControl } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export async function postEdhrTmplControl(data: OfProcessControlRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/edhr-tmpl/control`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 复制
 * import { postEdhrTmplCopyById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface postEdhrTmplCopyByIdPathInterface {
  id: string; // id
}
export async function postEdhrTmplCopyById(path: postEdhrTmplCopyByIdPathInterface, data: EdhrTmplCommonRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/edhr-tmpl/copy/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 复制版本
 * import { postEdhrTmplCopyVersionById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface postEdhrTmplCopyVersionByIdPathInterface {
  id: string; // id
}
export async function postEdhrTmplCopyVersionById(path: postEdhrTmplCopyVersionByIdPathInterface, data: EdhrTmplCommonRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/edhr-tmpl/copyVersion/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据id查子
 * import { getEdhrTmplGetVersionById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface getEdhrTmplGetVersionByIdQueryInterface {
  id: string; // id
}
export async function getEdhrTmplGetVersionById(params: getEdhrTmplGetVersionByIdQueryInterface = {}, config = {}): Promise<ResponseEntityEdhrTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-tmpl/getVersionById`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * edhr查询详情
 * import { getEdhrTmplInfo } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface getEdhrTmplInfoQueryInterface {
  edhrId: string; // id
}
export async function getEdhrTmplInfo(params: getEdhrTmplInfoQueryInterface = {}, config = {}): Promise<ResponseEntityEdhrTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-tmpl/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据父id查子列表
 * import { getEdhrTmplListVersionById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface getEdhrTmplListVersionByIdQueryInterface {
  id: string; // id
}
export async function getEdhrTmplListVersionById(params: getEdhrTmplListVersionByIdQueryInterface = {}, config = {}): Promise<ResponseEntityListEdhrTmplResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/edhr-tmpl/listVersionById`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteEdhrTmplRemoveById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface deleteEdhrTmplRemoveByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteEdhrTmplRemoveById(params: deleteEdhrTmplRemoveByIdQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/edhr-tmpl/removeById`,
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
 * 删除版本
 * import { deleteEdhrTmplRemoveVersionById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface deleteEdhrTmplRemoveVersionByIdQueryInterface {
  id: string; // 删除的id
}
export async function deleteEdhrTmplRemoveVersionById(params: deleteEdhrTmplRemoveVersionByIdQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/edhr-tmpl/removeVersionById`,
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
 * 保存
 * import { postEdhrTmplSave } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export async function postEdhrTmplSave(data: EdhrTmplCommonRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/edhr-tmpl/save`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存版本
 * import { postEdhrTmplSaveVersion } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export async function postEdhrTmplSaveVersion(data: EdhrTmplCommonRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/edhr-tmpl/saveVersion`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 设为默认版本
 * import { putEdhrTmplSetDefaultById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface putEdhrTmplSetDefaultByIdPathInterface {
  id: string; // id
}
export async function putEdhrTmplSetDefaultById(path: putEdhrTmplSetDefaultByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/edhr-tmpl/setDefault/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改状态
 * import { putEdhrTmplUpdateOperatingStateById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface putEdhrTmplUpdateOperatingStateByIdPathInterface {
  id: string; // id
}
export async function putEdhrTmplUpdateOperatingStateById(path: putEdhrTmplUpdateOperatingStateByIdPathInterface, data: OperatingStateRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/edhr-tmpl/updateOperatingState/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改版本
 * import { putEdhrTmplUpdateVersionByIdById } from "/@/apis/gct-apaas/EdhrTmplController"
 */
export interface putEdhrTmplUpdateVersionByIdByIdPathInterface {
  id: string; // id
}
export async function putEdhrTmplUpdateVersionByIdById(path: putEdhrTmplUpdateVersionByIdByIdPathInterface, data: EdhrTmplRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/edhr-tmpl/updateVersionById/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}