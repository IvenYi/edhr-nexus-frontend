import request from '@mobile/utils/request';
import type { PublishLogRequest, ResponseEntitystring, CreateReleaseRequest, ResponseEntityPublishLogResponse, ResponseEntityListPublishLogResponse, ResponseEntityPageBasePublishLogResponse, PublishToProdRequest, PublishToTestRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postPublishLog } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function postPublishLog(data: PublishLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log`,
      method: 'post',
      data,
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
export async function deletePublishLog(params: deletePublishLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 创建发行
 * import { postPublishLogCreateRelease } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function postPublishLogCreateRelease(data: CreateReleaseRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log/createRelease`,
      method: 'post',
      data,
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
export async function getPublishLogInfo(params: getPublishLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getPublishLogList } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function getPublishLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListPublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log/list`,
      method: 'get',
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
export async function getPublishLogPageList(params: getPublishLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBasePublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 发布到生产环境
 * import { postPublishLogPublishToProd } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function postPublishLogPublishToProd(data: PublishToProdRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log/publishToProd`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 发布到测试环境
 * import { postPublishLogPublishToTest } from "/@/apis/gct-apaas/PublishLogController"
 */
export async function postPublishLogPublishToTest(data: PublishToTestRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log/publishToTest`,
      method: 'post',
      data,
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
export async function putPublishLogById(path: putPublishLogByIdPathInterface, data: PublishLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/publish-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}