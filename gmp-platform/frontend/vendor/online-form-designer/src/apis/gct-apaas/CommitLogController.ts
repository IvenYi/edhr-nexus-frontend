import { defHttp } from '@/utils/http/axios';
import { CommitLogRequest, ResponseEntitystring, ResponseEntityListstring, CommitRequest, ResponseEntityCommitLogResponse, ResponseEntityListCommitLogResponse, ResponseEntityPageBaseCommitLogResponse, ResponseEntityListReadableCommitDetailDTO } from './model/index';

/**
 * 保存
 * import { postCommitLog } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function postCommitLog(data: CommitLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/commit-log`,
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
 * import { deleteCommitLog } from "/@/apis/gct-apaas/CommitLogController"
 */
export interface deleteCommitLogQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteCommitLog(params: deleteCommitLogQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/api/commit-log`,
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
 * 可发布生产的发行标识列表查询
 * import { getCommitLogCanPublishProdReleaseTagList } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogCanPublishProdReleaseTagList(config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/canPublishProdReleaseTagList`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 能发行的提交标识列表
 * import { getCommitLogCanReleaseTagList } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogCanReleaseTagList(config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/canReleaseTagList`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 提交
 * import { postCommitLogCommit } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function postCommitLogCommit(data: CommitRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/commit-log/commit`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查看最新提交信息
 * import { getCommitLogGetLatestCommit } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogGetLatestCommit(config = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/getLatestCommit`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCommitLogInfo(params: getCommitLogInfoQueryInterface = {}, config = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/info`,
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
 * import { getCommitLogList } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogList(config = {}): Promise<ResponseEntityListCommitLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/list`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCommitLogPageList(params: getCommitLogPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseCommitLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCommitLogReleaseInfo(params: getCommitLogReleaseInfoQueryInterface = {}, config = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/release/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCommitLogReleasePageList(params: getCommitLogReleasePageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseCommitLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/release/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getCommitLogViewDetail(params: getCommitLogViewDetailQueryInterface = {}, config = {}): Promise<ResponseEntityListReadableCommitDetailDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/viewDetail`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 浏览草稿
 * import { getCommitLogViewDraft } from "/@/apis/gct-apaas/CommitLogController"
 */
export async function getCommitLogViewDraft(config = {}): Promise<ResponseEntityListReadableCommitDetailDTO['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/commit-log/viewDraft`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function putCommitLogById(path: putCommitLogByIdPathInterface, data: CommitLogRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-apaas/api/commit-log/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}