import { defHttp } from '@/utils/http/axios';
import { CreateBranchRequest, ResponseEntitystring, CreateAppRequest, ResponseEntityCreateImportAppResponse, ResponseEntityboolean, ResponseEntityVoid, ResponseEntityListFieldMetaResponse, ResponseEntityListMenuConfig, ResponseEntityAppBranchResponse, ResponseEntityListstring, ResponseEntityCommitLogResponse, ImportVersionRequest, ResponseEntityMergePreviewResponse, ResponseEntityListAppBranchResponse, MergeRequest, ResponseEntityMergeLogResponse, ResponseEntityPageBaseMergeLogResponse, ResponseEntityListModelCompleteResponse, ResponseEntityPublishLogResponse, ResponseEntityPageBaseAppPublishLogResponse, ResponseEntityLinkedHashMapstringListReport, RevertRequest, SwitchBranchRequest, UserOfApp } from './model/index';

/**
 * 创建版本/分支
 * import { postAppCreateBranchExternal } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppCreateBranchExternal(data: CreateBranchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/app/createBranch`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 创建导入应用
 * import { postAppCreateImportAppExternal } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppCreateImportAppExternal(data: CreateAppRequest, config = {}): Promise<ResponseEntityCreateImportAppResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/app/createImportApp`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据索引名称查询索引
 * import { getAppCreateIndexExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppCreateIndexExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  fieldKeys: string; // fieldKeys
  indexName: string; // indexName
  modelKey: string; // modelKey
}
export async function getAppCreateIndexExternal(params: getAppCreateIndexExternalQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/createIndex`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 创建自建应用
 * import { postAppCreateSelfBuiltAppExternal } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppCreateSelfBuiltAppExternal(data: CreateAppRequest, config = {}): Promise<ResponseEntityVoid['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/app/createSelfBuiltApp`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据索引名称查询索引
 * import { getAppDeleteIndexExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppDeleteIndexExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  indexName: string; // indexName
  modelKey: string; // modelKey
}
export async function getAppDeleteIndexExternal(params: getAppDeleteIndexExternalQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/deleteIndex`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 删除生产环境数据库
 * import { deleteAppDropProdDbExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface deleteAppDropProdDbExternalQueryInterface {
  appId: string; // appId
}
export async function deleteAppDropProdDbExternal(params: deleteAppDropProdDbExternalQueryInterface = {}, config = {}): Promise<ResponseEntityVoid['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/external/api/app/dropProdDb`,
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
 * 删除测试环境数据库（后门接口，谨慎使用！）
 * import { deleteAppDropTestDbExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface deleteAppDropTestDbExternalQueryInterface {
  appId: string; // appId
}
export async function deleteAppDropTestDbExternal(params: deleteAppDropTestDbExternalQueryInterface = {}, config = {}): Promise<ResponseEntityVoid['data']> {
  return defHttp.delete(
    {
      url: `/gct-apaas/external/api/app/dropTestDb`,
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
 * 根据appid获取应用最新分支的所有模型
 * import { getAppFieldMetaListExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppFieldMetaListExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  includeBuiltin?: boolean; // includeBuiltin
  includeProcess?: boolean; // includeProcess
  keyword?: string; // keyword
  modelKey: string; // modelKey
  sys?: boolean; // sys
}
export async function getAppFieldMetaListExternal(params: getAppFieldMetaListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListFieldMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/field-meta/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用菜单
 * import { getAppGetAppMenuExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetAppMenuExternalQueryInterface {
  appEnv: string; // appEnv
  appId: string; // appId
  menuType: string; // menuType
}
export async function getAppGetAppMenuExternal(params: getAppGetAppMenuExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListMenuConfig['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/getAppMenu`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取当前版本/分支
 * import { getAppGetCurrentBranchExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetCurrentBranchExternalQueryInterface {
  appId: string; // appId
}
export async function getAppGetCurrentBranchExternal(params: getAppGetCurrentBranchExternalQueryInterface = {}, config = {}): Promise<ResponseEntityAppBranchResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/getCurrentBranch`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据索引名称查询索引
 * import { getAppGetIndexExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetIndexExternalQueryInterface {
  appId: string; // appId
  env: string; // env
  indexName?: string; // indexName
  modelKey: string; // modelKey
  preName?: string; // preName
}
export async function getAppGetIndexExternal(params: getAppGetIndexExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/getIndex`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取最新版本/分支
 * import { getAppGetLatestBranchExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetLatestBranchExternalQueryInterface {
  appId: string; // appId
}
export async function getAppGetLatestBranchExternal(params: getAppGetLatestBranchExternalQueryInterface = {}, config = {}): Promise<ResponseEntityAppBranchResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/getLatestBranch`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取最新提交
 * import { getAppGetLatestCommitExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppGetLatestCommitExternalQueryInterface {
  appId: string; // appId
  branchId: string; // branchId
}
export async function getAppGetLatestCommitExternal(params: getAppGetLatestCommitExternalQueryInterface = {}, config = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/getLatestCommit`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 导入版本
 * import { postAppImportVersionExternal } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppImportVersionExternal(data: ImportVersionRequest, config = {}): Promise<ResponseEntityCreateImportAppResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/app/importVersion`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 导入版本预览
 * import { getAppImportVersionPreviewExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppImportVersionPreviewExternalQueryInterface {
  appId: string; // appId
  appPkgUrl: string; // appPkgUrl
}
export async function getAppImportVersionPreviewExternal(params: getAppImportVersionPreviewExternalQueryInterface = {}, config = {}): Promise<ResponseEntityMergePreviewResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/importVersionPreview`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询版本/分支列表
 * import { getAppListBranchExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppListBranchExternalQueryInterface {
  appId: string; // appId
}
export async function getAppListBranchExternal(params: getAppListBranchExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListAppBranchResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/listBranch`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 合并
 * import { postAppMergeExternal } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppMergeExternal(data: MergeRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/app/merge`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 合并详情
 * import { getAppMergeInfoExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppMergeInfoExternalQueryInterface {
  appId: string; // appId
  id: string; // id
}
export async function getAppMergeInfoExternal(params: getAppMergeInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityMergeLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/merge/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 合并记录分页列表
 * import { getAppMergePageListExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppMergePageListExternalQueryInterface {
  appId: string; // appId
  keyword?: string; // keyword
  pageNo?: number; // pageNo
  pageSize?: number; // pageSize
}
export async function getAppMergePageListExternal(params: getAppMergePageListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseMergeLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/merge/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 合并预览
 * import { getAppMergePreviewExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppMergePreviewExternalQueryInterface {
  appId: string; // appId
  sourceBranchId: string; // sourceBranchId
  targetBranchId: string; // targetBranchId
}
export async function getAppMergePreviewExternal(params: getAppMergePreviewExternalQueryInterface = {}, config = {}): Promise<ResponseEntityMergePreviewResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/mergePreview`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用最新分支的所有模型
 * import { getAppModelMetaListExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppModelMetaListExternalQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function getAppModelMetaListExternal(params: getAppModelMetaListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListModelCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/model-meta/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询发布日志详情
 * import { getAppPublishLogInfoExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppPublishLogInfoExternalQueryInterface {
  appId: string; // appId
  branchId: string; // branchId
  publishId: string; // publishId
}
export async function getAppPublishLogInfoExternal(params: getAppPublishLogInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/publishLogInfo`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页查询发布日志
 * import { getAppPublishLogPageListExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppPublishLogPageListExternalQueryInterface {
  appEnv?: string; // 环境 test/prod
  appId: string; // 应用id
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  state?: string; // 状态
}
export async function getAppPublishLogPageListExternal(params: getAppPublishLogPageListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/publishLogPageList`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 报表列表获取(按类型)
 * import { getAppReportInfosExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface getAppReportInfosExternalQueryInterface {
  appId?: string; // app id
  env?: string; // 环境
  type?: boolean; // true:按分类，false:按数据集
}
export async function getAppReportInfosExternal(params: getAppReportInfosExternalQueryInterface = {}, config = {}): Promise<ResponseEntityLinkedHashMapstringListReport['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/external/api/app/report/infos`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 回退上一版
 * import { postAppRevertExternal } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppRevertExternal(data: RevertRequest, config = {}): Promise<ResponseEntityPublishLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/app/revert`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 切换版本/分支
 * import { postAppSwitchBranchExternal } from "/@/apis/gct-apaas/AppController"
 */
export async function postAppSwitchBranchExternal(data: SwitchBranchRequest, config = {}): Promise<ResponseEntityVoid['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/app/switchBranch`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用菜单
 * import { postAppVisibleMenuExternal } from "/@/apis/gct-apaas/AppController"
 */
export interface postAppVisibleMenuExternalQueryInterface {
  appEnv: string; // appEnv
  appId: string; // appId
  menuType: string; // menuType
}
export async function postAppVisibleMenuExternal(data: UserOfApp, params: postAppVisibleMenuExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListMenuConfig['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/external/api/app/visible/menu`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}