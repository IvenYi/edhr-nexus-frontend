import request from '@mobile/utils/request';
import type { CreateBranchRequest, ResponseEntitystring, CreateAppRequest, ResponseEntityCreateImportAppResponse, ResponseEntityboolean, ResponseEntityVoid, ResponseEntityListFieldMetaResponse, ResponseEntityListMenuConfig, ResponseEntityAppBranchResponse, ResponseEntityListstring, ResponseEntityCommitLogResponse, ImportVersionRequest, ResponseEntityMergePreviewResponse, ResponseEntityListAppBranchResponse, MergeRequest, ResponseEntityMergeLogResponse, ResponseEntityPageBaseMergeLogResponse, ResponseEntityListModelCompleteResponse, ResponseEntityPublishLogResponse, ResponseEntityPageBaseAppPublishLogResponse, ResponseEntityLinkedHashMapstringListReport, RevertRequest, SwitchBranchRequest, UserOfApp } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 创建版本/分支
 * import { postAppCreateBranch } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppCreateBranch(data: CreateBranchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/createBranch`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 创建导入应用
 * import { postAppCreateImportApp } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppCreateImportApp(data: CreateAppRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityCreateImportAppResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/createImportApp`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据索引名称查询索引
 * import { getAppCreateIndex } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppCreateIndexQueryInterface {
  appId: string; // appId
  env: string; // env
  fieldKeys: string; // fieldKeys
  indexName: string; // indexName
  modelKey: string; // modelKey
}
export async function getAppCreateIndex(params: getAppCreateIndexQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/createIndex`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 创建自建应用
 * import { postAppCreateSelfBuiltApp } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppCreateSelfBuiltApp(data: CreateAppRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityVoid['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/createSelfBuiltApp`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据索引名称查询索引
 * import { getAppDeleteIndex } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppDeleteIndexQueryInterface {
  appId: string; // appId
  env: string; // env
  indexName: string; // indexName
  modelKey: string; // modelKey
}
export async function getAppDeleteIndex(params: getAppDeleteIndexQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/deleteIndex`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 删除生产环境数据库
 * import { deleteAppDropProdDb } from "/@/apis/gct-apaas/AppController"
 */
export interface deleteAppDropProdDbQueryInterface {
  appId: string; // appId
}
export async function deleteAppDropProdDb(params: deleteAppDropProdDbQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityVoid['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/dropProdDb`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 删除测试环境数据库（后门接口，谨慎使用！）
 * import { deleteAppDropTestDb } from "/@/apis/gct-apaas/AppController"
 */
export interface deleteAppDropTestDbQueryInterface {
  appId: string; // appId
}
export async function deleteAppDropTestDb(params: deleteAppDropTestDbQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityVoid['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/dropTestDb`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 根据appid获取应用最新分支的所有模型
 * import { getAppFieldMetaList } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppFieldMetaListQueryInterface {
  appId: string; // appId
  env: string; // env
  includeBuiltin?: boolean; // includeBuiltin
  includeProcess?: boolean; // includeProcess
  keyword?: string; // keyword
  modelKey: string; // modelKey
  sys?: boolean; // sys
}
export async function getAppFieldMetaList(params: getAppFieldMetaListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListFieldMetaResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/field-meta/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用菜单
 * import { getAppGetAppMenu } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetAppMenuQueryInterface {
  appEnv: string; // appEnv
  appId: string; // appId
  menuType: string; // menuType
}
export async function getAppGetAppMenu(params: getAppGetAppMenuQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMenuConfig['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getAppMenu`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取当前版本/分支
 * import { getAppGetCurrentBranch } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetCurrentBranchQueryInterface {
  appId: string; // appId
}
export async function getAppGetCurrentBranch(params: getAppGetCurrentBranchQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppBranchResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getCurrentBranch`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据索引名称查询索引
 * import { getAppGetIndex } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetIndexQueryInterface {
  appId: string; // appId
  env: string; // env
  indexName?: string; // indexName
  modelKey: string; // modelKey
  preName?: string; // preName
}
export async function getAppGetIndex(params: getAppGetIndexQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getIndex`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取最新版本/分支
 * import { getAppGetLatestBranch } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetLatestBranchQueryInterface {
  appId: string; // appId
}
export async function getAppGetLatestBranch(params: getAppGetLatestBranchQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityAppBranchResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getLatestBranch`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取最新提交
 * import { getAppGetLatestCommit } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetLatestCommitQueryInterface {
  appId: string; // appId
  branchId: string; // branchId
}
export async function getAppGetLatestCommit(params: getAppGetLatestCommitQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/getLatestCommit`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 导入版本
 * import { postAppImportVersion } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppImportVersion(data: ImportVersionRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityCreateImportAppResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/importVersion`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 导入版本预览
 * import { getAppImportVersionPreview } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppImportVersionPreviewQueryInterface {
  appId: string; // appId
  appPkgUrl: string; // appPkgUrl
}
export async function getAppImportVersionPreview(params: getAppImportVersionPreviewQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMergePreviewResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/importVersionPreview`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询版本/分支列表
 * import { getAppListBranch } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppListBranchQueryInterface {
  appId: string; // appId
}
export async function getAppListBranch(params: getAppListBranchQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListAppBranchResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/listBranch`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 合并
 * import { postAppMerge } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppMerge(data: MergeRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/merge`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 合并详情
 * import { getAppMergeInfo } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppMergeInfoQueryInterface {
  appId: string; // appId
  id: string; // id
}
export async function getAppMergeInfo(params: getAppMergeInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMergeLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/merge/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 合并记录分页列表
 * import { getAppMergePageList } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppMergePageListQueryInterface {
  appId: string; // appId
  keyword?: string; // keyword
  pageNo?: number; // pageNo
  pageSize?: number; // pageSize
}
export async function getAppMergePageList(params: getAppMergePageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseMergeLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/merge/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 合并预览
 * import { getAppMergePreview } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppMergePreviewQueryInterface {
  appId: string; // appId
  sourceBranchId: string; // sourceBranchId
  targetBranchId: string; // targetBranchId
}
export async function getAppMergePreview(params: getAppMergePreviewQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityMergePreviewResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/mergePreview`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用最新分支的所有模型
 * import { getAppModelMetaList } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppModelMetaListQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function getAppModelMetaList(params: getAppModelMetaListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListModelCompleteResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/model-meta/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询发布日志详情
 * import { getAppPublishLogInfo } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppPublishLogInfoQueryInterface {
  appId: string; // appId
  branchId: string; // branchId
  publishId: string; // publishId
}
export async function getAppPublishLogInfo(params: getAppPublishLogInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/publishLogInfo`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页查询发布日志
 * import { getAppPublishLogPageList } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppPublishLogPageListQueryInterface {
  appEnv?: string; // 环境 test/prod
  appId: string; // 应用id
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  state?: string; // 状态
}
export async function getAppPublishLogPageList(params: getAppPublishLogPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseAppPublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/publishLogPageList`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 报表列表获取(按类型)
 * import { getAppReportInfos } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppReportInfosQueryInterface {
  appId?: string; // app id
  env?: string; // 环境
  type?: boolean; // true:按分类，false:按数据集
}
export async function getAppReportInfos(params: getAppReportInfosQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityLinkedHashMapstringListReport['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/report/infos`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 回退上一版
 * import { postAppRevert } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppRevert(data: RevertRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPublishLogResponse['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/revert`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 切换版本/分支
 * import { postAppSwitchBranch } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppSwitchBranch(data: SwitchBranchRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityVoid['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/switchBranch`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用菜单
 * import { postAppVisibleMenu } from "/@/apis/gct-apaas/AppController"
 */
export interface postAppVisibleMenuQueryInterface {
  appEnv: string; // appEnv
  appId: string; // appId
  menuType: string; // menuType
}
export async function postAppVisibleMenu(data: UserOfApp, params: postAppVisibleMenuQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMenuConfig['data']> {
  return request(
    {
      url: `/gct-apaas/external/api/app/visible/menu`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}