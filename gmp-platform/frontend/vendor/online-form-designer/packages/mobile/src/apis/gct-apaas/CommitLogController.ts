import request from '@mobile/utils/request';
import type { CommitLogRequest, ResponseEntitystring, ResponseEntityListstring, CommitRequest, ResponseEntityCommitLogResponse, ResponseEntityListCommitLogResponse, ResponseEntityPageBaseCommitLogResponse, ResponseEntityListReadableCommitDetailDTO } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 保存
 * import { postCommitLog } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function postCommitLog(data: CommitLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteCommitLog } from "/@/apis/gct-apaas/CommitLogController"
 */
export interface deleteCommitLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCommitLog(params: deleteCommitLogQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 可发布生产的发行标识列表查询
 * import { getCommitLogCanPublishProdReleaseTagList } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogCanPublishProdReleaseTagList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/canPublishProdReleaseTagList`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 能发行的提交标识列表
 * import { getCommitLogCanReleaseTagList } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogCanReleaseTagList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/canReleaseTagList`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 提交
 * import { postCommitLogCommit } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function postCommitLogCommit(data: CommitRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/commit`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查看最新提交信息
 * import { getCommitLogGetLatestCommit } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogGetLatestCommit(config:AxiosRequestConfig = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/getLatestCommit`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getCommitLogInfo } from "/@/apis/gct-apaas/CommitLogController"
 */
export interface getCommitLogInfoQueryInterface {
  id: string; // id
}
export async function getCommitLogInfo(params: getCommitLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getCommitLogList } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListCommitLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getCommitLogPageList } from "/@/apis/gct-apaas/CommitLogController"
 */
export interface getCommitLogPageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getCommitLogPageList(params: getCommitLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseCommitLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 发行记录详情
 * import { getCommitLogReleaseInfo } from "/@/apis/gct-apaas/CommitLogController"
 */
export interface getCommitLogReleaseInfoQueryInterface {
  releaseTag: string; // releaseTag
}
export async function getCommitLogReleaseInfo(params: getCommitLogReleaseInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/release/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 发行记录分页列表
 * import { getCommitLogReleasePageList } from "/@/apis/gct-apaas/CommitLogController"
 */
export interface getCommitLogReleasePageListQueryInterface {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
}
export async function getCommitLogReleasePageList(params: getCommitLogReleasePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseCommitLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/release/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 浏览提交详情
 * import { getCommitLogViewDetail } from "/@/apis/gct-apaas/CommitLogController"
 */
export interface getCommitLogViewDetailQueryInterface {
  commitId: string; // 提交id
}
export async function getCommitLogViewDetail(params: getCommitLogViewDetailQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListReadableCommitDetailDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/viewDetail`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 浏览草稿
 * import { getCommitLogViewDraft } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogViewDraft(config:AxiosRequestConfig = {}): Promise<ResponseEntityListReadableCommitDetailDTO['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/viewDraft`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 修改
 * import { putCommitLogById } from "/@/apis/gct-apaas/CommitLogController"
 */
export interface putCommitLogByIdPathInterface {
  id: string; // id
}
export async function putCommitLogById(path: putCommitLogByIdPathInterface, data: CommitLogRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/api/commit-log/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}