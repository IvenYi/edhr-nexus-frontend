import { defHttp } from '@/utils/http/axios';
import { PmProcessDelegateRequest, ResponseEntitystring, ResponseEntityPmProcessDelegateResponse, ResponseEntityListPmProcessDelegateResponse, ResponseEntityPageBasePmProcessDelegateResponse } from './model/index';

/**
 * 保存
 * import { postPmProcessDelegate } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export async function postPmProcessDelegate(data: PmProcessDelegateRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pm-process-delegate`,
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
 * import { deletePmProcessDelegate } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export interface deletePmProcessDelegateQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessDelegate(params: deletePmProcessDelegateQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/pm-process-delegate`,
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
 * import { getPmProcessDelegateInfo } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export interface getPmProcessDelegateInfoQueryInterface {
  id: string; // id
}
export async function getPmProcessDelegateInfo(params: getPmProcessDelegateInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPmProcessDelegateResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-delegate/info`,
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
 * import { getPmProcessDelegateList } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export async function getPmProcessDelegateList(config = {}): Promise<ResponseEntityListPmProcessDelegateResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-delegate/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmProcessDelegatePageList } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export interface getPmProcessDelegatePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPmProcessDelegatePageList(params: getPmProcessDelegatePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePmProcessDelegateResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-delegate/page/list`,
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
 * import { putPmProcessDelegateById } from "/@/apis/gct-platform/PmProcessDelegateController"
 */
export interface putPmProcessDelegateByIdPathInterface {
  id: string; // id
}
export async function putPmProcessDelegateById(path: putPmProcessDelegateByIdPathInterface, data: PmProcessDelegateRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/pm-process-delegate/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}