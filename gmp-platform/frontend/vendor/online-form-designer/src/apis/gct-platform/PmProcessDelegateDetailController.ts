import { defHttp } from '@/utils/http/axios';
import { PmProcessDelegateDetailRequest, ResponseEntitystring, ResponseEntityPmProcessDelegateDetailResponse, ResponseEntityListPmProcessDelegateDetailResponse, ResponseEntityPageBasePmProcessDelegateDetailResponse } from './model/index';

/**
 * 保存
 * import { postPmProcessDelegateDetail } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export async function postPmProcessDelegateDetail(data: PmProcessDelegateDetailRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/pm-process-delegate-detail`,
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
 * import { deletePmProcessDelegateDetail } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export interface deletePmProcessDelegateDetailQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePmProcessDelegateDetail(params: deletePmProcessDelegateDetailQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/pm-process-delegate-detail`,
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
 * import { getPmProcessDelegateDetailInfo } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export interface getPmProcessDelegateDetailInfoQueryInterface {
  id: string; // id
}
export async function getPmProcessDelegateDetailInfo(params: getPmProcessDelegateDetailInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPmProcessDelegateDetailResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-delegate-detail/info`,
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
 * import { getPmProcessDelegateDetailList } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export async function getPmProcessDelegateDetailList(config = {}): Promise<ResponseEntityListPmProcessDelegateDetailResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-delegate-detail/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPmProcessDelegateDetailPageList } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export interface getPmProcessDelegateDetailPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPmProcessDelegateDetailPageList(params: getPmProcessDelegateDetailPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePmProcessDelegateDetailResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/pm-process-delegate-detail/page/list`,
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
 * import { putPmProcessDelegateDetailById } from "/@/apis/gct-platform/PmProcessDelegateDetailController"
 */
export interface putPmProcessDelegateDetailByIdPathInterface {
  id: string; // id
}
export async function putPmProcessDelegateDetailById(path: putPmProcessDelegateDetailByIdPathInterface, data: PmProcessDelegateDetailRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/pm-process-delegate-detail/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}