import { defHttp } from '@/utils/http/axios';
import { PublishLogRequest, ResponseEntitystring, CreateReleaseRequest, ResponseEntityPublishLogResponse, ResponseEntityListPublishLogResponse, ResponseEntityPageBasePublishLogResponse, PublishToProdRequest, PublishToTestRequest } from './model/index';

/**
 * 保存
 * import { postPublishLog } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function postPublishLog(data: PublishLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/publish-log`,
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
 * import { deletePublishLog } from "/@/apis/gct-apaas/PublishLogController"
 */
export interface deletePublishLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deletePublishLog(params: deletePublishLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/publish-log`,
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
 * 创建发行
 * import { postPublishLogCreateRelease } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function postPublishLogCreateRelease(data: CreateReleaseRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/publish-log/createRelease`,
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
 * import { getPublishLogInfo } from "/@/apis/gct-apaas/PublishLogController"
 */
export interface getPublishLogInfoQueryInterface {
  id: string; // id
}
export async function getPublishLogInfo(params: getPublishLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/publish-log/info`,
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
 * import { getPublishLogList } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function getPublishLogList(config = {}): Promise<ResponseEntityListPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/publish-log/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getPublishLogPageList } from "/@/apis/gct-apaas/PublishLogController"
 */
export interface getPublishLogPageListQueryInterface {
  appEnv: string; // 环境 test/prod
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getPublishLogPageList(params: getPublishLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBasePublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/publish-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 发布到生产环境
 * import { postPublishLogPublishToProd } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function postPublishLogPublishToProd(data: PublishToProdRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/publish-log/publishToProd`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 发布到测试环境
 * import { postPublishLogPublishToTest } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function postPublishLogPublishToTest(data: PublishToTestRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/publish-log/publishToTest`,
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
 * import { putPublishLogById } from "/@/apis/gct-apaas/PublishLogController"
 */
export interface putPublishLogByIdPathInterface {
  id: string; // id
}
export async function putPublishLogById(path: putPublishLogByIdPathInterface, data: PublishLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/publish-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}