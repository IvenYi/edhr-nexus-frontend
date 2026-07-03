import { defHttp } from '@/utils/http/axios';
import { SignLogRequestDTO, ResponseEntitystring, ResponseEntitySignLogResponse, ResponseEntityListSignLogResponse, SignLogRequest, ResponseEntityListUserInfo, ResponseEntityPageBaseSignLogResponse } from './model/index';

/**
 * 保存
 * import { postSignLog } from "/@/apis/gct-platform/SignLogController"
 */
export async function postSignLog(data: SignLogRequestDTO, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/sign-log`,
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
 * import { deleteSignLog } from "/@/apis/gct-platform/SignLogController"
 */
export interface deleteSignLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteSignLog(params: deleteSignLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/sign-log`,
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
 * import { getSignLogInfo } from "/@/apis/gct-platform/SignLogController"
 */
export interface getSignLogInfoQueryInterface {
  id: string; // id
}
export async function getSignLogInfo(params: getSignLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntitySignLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/sign-log/info`,
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
 * import { getSignLogList } from "/@/apis/gct-platform/SignLogController"
 */
export async function getSignLogList(config = {}): Promise<ResponseEntityListSignLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/sign-log/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 操作人
 * import { postSignLogOperators } from "/@/apis/gct-platform/SignLogController"
 */
export async function postSignLogOperators(data: SignLogRequest, config = {}): Promise<ResponseEntityListUserInfo['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/sign-log/operators`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { postSignLogPageList } from "/@/apis/gct-platform/SignLogController"
 */
export async function postSignLogPageList(data: SignLogRequest, config = {}): Promise<ResponseEntityPageBaseSignLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/sign-log/page/list`,
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
 * import { putSignLogById } from "/@/apis/gct-platform/SignLogController"
 */
export interface putSignLogByIdPathInterface {
  id: string; // id
}
export async function putSignLogById(path: putSignLogByIdPathInterface, data: SignLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/sign-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}