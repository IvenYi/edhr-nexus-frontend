import { defHttp } from '@/utils/http/axios';
import { PageDesignerLogRequest, ResponseEntitystring, ResponseEntityPageDesignerLogResponse, ResponseEntityListPageDesignerLogResponse, ResponseEntityPageBasePageDesignerLogResponse } from './model/index';

/**
 * 保存
 * import { postPageDesignerLog } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export async function postPageDesignerLog(data: PageDesignerLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/page-designer-log`,
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
 * import { deletePageDesignerLog } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export interface deletePageDesignerLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePageDesignerLog(params: deletePageDesignerLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/page-designer-log`,
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
 * import { getPageDesignerLogInfo } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export interface getPageDesignerLogInfoQueryInterface {
  id: string; // id
}
export async function getPageDesignerLogInfo(params: getPageDesignerLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPageDesignerLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/page-designer-log/info`,
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
 * import { getPageDesignerLogList } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export async function getPageDesignerLogList(config = {}): Promise<ResponseEntityListPageDesignerLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/page-designer-log/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPageDesignerLogPageList } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export interface getPageDesignerLogPageListQueryInterface {
  endTime?: string; // 结束时间
  id?: string; // 主键id
  name?: string; // 页面名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  relationId?: string; // 管理数据id
  relationType?: number; // 类型（1 web、2 pda 、3 pad）
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
}
export async function getPageDesignerLogPageList(params: getPageDesignerLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePageDesignerLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/page-designer-log/page/list`,
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
 * import { putPageDesignerLogById } from "/@/apis/gct-apaas/PageDesignerLogController"
 */
export interface putPageDesignerLogByIdPathInterface {
  id: string; // id
}
export async function putPageDesignerLogById(path: putPageDesignerLogByIdPathInterface, data: PageDesignerLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/page-designer-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}