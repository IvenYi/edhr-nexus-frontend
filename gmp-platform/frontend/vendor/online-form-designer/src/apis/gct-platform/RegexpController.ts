import { defHttp } from '@/utils/http/axios';
import { RegexpRequest, ResponseEntitystring, ResponseEntityRegexpResponse, ResponseEntityListRegexpResponse, ResponseEntityPageBaseRegexpResponse } from './model/index';

/**
 * 保存
 * import { postRegexp } from "/@/apis/gct-platform/RegexpController"
 */
export async function postRegexp(data: RegexpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/regexp`,
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
 * import { deleteRegexp } from "/@/apis/gct-platform/RegexpController"
 */
export interface deleteRegexpQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteRegexp(params: deleteRegexpQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/regexp`,
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
 * import { getRegexpInfo } from "/@/apis/gct-platform/RegexpController"
 */
export interface getRegexpInfoQueryInterface {
  id: string; // id
}
export async function getRegexpInfo(params: getRegexpInfoQueryInterface = {}, config = {}): Promise<ResponseEntityRegexpResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/regexp/info`,
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
 * import { getRegexpList } from "/@/apis/gct-platform/RegexpController"
 */
export async function getRegexpList(config = {}): Promise<ResponseEntityListRegexpResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/regexp/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getRegexpPageList } from "/@/apis/gct-platform/RegexpController"
 */
export interface getRegexpPageListQueryInterface {
  endTime?: string; // 结束时间
  name?: string; // 正则名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  value?: string; // 正则值
}
export async function getRegexpPageList(params: getRegexpPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseRegexpResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/regexp/page/list`,
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
 * import { putRegexpById } from "/@/apis/gct-platform/RegexpController"
 */
export interface putRegexpByIdPathInterface {
  id: string; // id
}
export async function putRegexpById(path: putRegexpByIdPathInterface, data: RegexpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/regexp/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}