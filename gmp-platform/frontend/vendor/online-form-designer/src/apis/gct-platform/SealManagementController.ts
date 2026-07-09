import { defHttp } from '@/utils/http/axios';
import { SealManagementRequest, ResponseEntitystring, ResponseEntityboolean, ResponseEntitySealManagementResponse, ResponseEntityListSealManagementResponse, ResponseEntityPageBaseSealManagementResponse } from './model/index';

/**
 * 保存
 * import { postSealManagement } from "/@/apis/gct-platform/SealManagementController"
 */
export async function postSealManagement(data: SealManagementRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/seal-management`,
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
 * import { deleteSealManagement } from "/@/apis/gct-platform/SealManagementController"
 */
export interface deleteSealManagementQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSealManagement(params: deleteSealManagementQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/seal-management`,
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
 * 判断名称是否重复
 * import { getSealManagementCheckName } from "/@/apis/gct-platform/SealManagementController"
 */
export interface getSealManagementCheckNameQueryInterface {
  name: string; // 名称
}
export async function getSealManagementCheckName(params: getSealManagementCheckNameQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seal-management/checkName`,
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
 * import { getSealManagementInfo } from "/@/apis/gct-platform/SealManagementController"
 */
export interface getSealManagementInfoQueryInterface {
  id: string; // id
}
export async function getSealManagementInfo(params: getSealManagementInfoQueryInterface = {}, config = {}): Promise<ResponseEntitySealManagementResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seal-management/info`,
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
 * import { getSealManagementList } from "/@/apis/gct-platform/SealManagementController"
 */
export async function getSealManagementList(config = {}): Promise<ResponseEntityListSealManagementResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/seal-management/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postSealManagementPageList } from "/@/apis/gct-platform/SealManagementController"
 */
export async function postSealManagementPageList(data: SealManagementRequest, config = {}): Promise<ResponseEntityPageBaseSealManagementResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/seal-management/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 修改密码
 * import { postSealManagementUpdatePassword } from "/@/apis/gct-platform/SealManagementController"
 */
export async function postSealManagementUpdatePassword(data: SealManagementRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/seal-management/updatePassword`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 编辑
 * import { putSealManagementById } from "/@/apis/gct-platform/SealManagementController"
 */
export async function putSealManagementById(data: SealManagementRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/seal-management/{id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}