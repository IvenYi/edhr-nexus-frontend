import { defHttp } from '@/utils/http/axios';
import { AppRequest, ResponseEntitystring, CreateBranchRequest, ResponseEntityListAppResponse, ResponseEntityListFieldMetaResponse, ResponseEntityAppCountDto, ResponseEntityAppBranchResponse, ResponseEntityCommitLogResponse, ImportVersionRequest, ResponseEntityCreateImportAppResponse, ResponseEntityMergePreviewResponse, ResponseEntityAppResponse, ResponseEntityListAppBranchResponse, ResponseEntityMergeLogResponse, ResponseEntityPageBaseMergeLogResponse, MergeRequest, ResponseEntityListModelCompleteResponse, ResponseEntityPageBaseAppResponse, ResponseEntityPublishLogResponse, ResponseEntityPageBaseAppPublishLogResponse, ResponseEntityLinkedHashMapstringListReport, RevertRequest, SwitchBranchRequest, ResponseEntityVoid, ResponseEntitylong } from './model/index';

/**
 * 保存
 * import { postApp } from "/@/apis/gct-platform/AppController"
 */
export async function postApp(data: AppRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app`,
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
 * import { deleteApp } from "/@/apis/gct-platform/AppController"
 */
export interface deleteAppQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteApp(params: deleteAppQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/api/app`,
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
 * 回收站清除应用
 * import { putAppAppCleanUpById } from "/@/apis/gct-platform/AppController"
 */
export interface putAppAppCleanUpByIdPathInterface {
  id: string; // id
}
export async function putAppAppCleanUpById(path: putAppAppCleanUpByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/app/appCleanUp/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 回收站还原应用
 * import { putAppAppRestoreByIdByUserId } from "/@/apis/gct-platform/AppController"
 */
export interface putAppAppRestoreByIdByUserIdPathInterface {
  id: string; // id
  userId: string; // userId
}
export async function putAppAppRestoreByIdByUserId(path: putAppAppRestoreByIdByUserIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/app/appRestore/${path?.id}/${path?.userId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 校验应用的维护者是否还在该租户的开发人员列表中
 * import { getAppCheckAppMaintainerInTenantByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppCheckAppMaintainerInTenantByAppIdPathInterface {
  appId: string; // appId
}
export async function getAppCheckAppMaintainerInTenantByAppId(path: getAppCheckAppMaintainerInTenantByAppIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/checkAppMaintainerInTenant/${path?.appId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 创建版本/分支
 * import { postAppCreateBranchByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface postAppCreateBranchByAppIdPathInterface {
  appId: string; // appId
}
export async function postAppCreateBranchByAppId(path: postAppCreateBranchByAppIdPathInterface, data: CreateBranchRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app/createBranch/${path?.appId}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 数据迁移的应用
 * import { getAppDatamoveApps } from "/@/apis/gct-platform/AppController"
 */
export async function getAppDatamoveApps(config = {}): Promise<ResponseEntityListAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/datamove/apps`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 锁定应用
 * import { putAppDisableById } from "/@/apis/gct-platform/AppController"
 */
export interface putAppDisableByIdPathInterface {
  id: string; // id
}
export async function putAppDisableById(path: putAppDisableByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/app/disable/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 解锁应用
 * import { putAppEnableById } from "/@/apis/gct-platform/AppController"
 */
export interface putAppEnableByIdPathInterface {
  id: string; // id
}
export async function putAppEnableById(path: putAppEnableByIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/app/enable/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用模型下的字段
 * import { getAppFieldMetaList } from "/@/apis/gct-platform/AppController"
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
export async function getAppFieldMetaList(params: getAppFieldMetaListQueryInterface = {}, config = {}): Promise<ResponseEntityListFieldMetaResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/field-meta/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 租户应用数量查询
 * import { getAppGetAppCountByTenantId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppGetAppCountByTenantIdPathInterface {
  tenantId: string; // tenantId
}
export interface getAppGetAppCountByTenantIdQueryInterface {
  type?: string; // type
}
export async function getAppGetAppCountByTenantId(path: getAppGetAppCountByTenantIdPathInterface, params: getAppGetAppCountByTenantIdQueryInterface = {}, config = {}): Promise<ResponseEntityAppCountDto['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/getAppCount/${path?.tenantId}`,
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
 * import { getAppGetCurrentBranchByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppGetCurrentBranchByAppIdPathInterface {
  appId: string; // appId
}
export async function getAppGetCurrentBranchByAppId(path: getAppGetCurrentBranchByAppIdPathInterface, config = {}): Promise<ResponseEntityAppBranchResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/getCurrentBranch/${path?.appId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取最新提交
 * import { getAppGetLatestCommitByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppGetLatestCommitByAppIdPathInterface {
  appId: string; // appId
}
export interface getAppGetLatestCommitByAppIdQueryInterface {
  branchId: string; // branchId
}
export async function getAppGetLatestCommitByAppId(path: getAppGetLatestCommitByAppIdPathInterface, params: getAppGetLatestCommitByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntityCommitLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/getLatestCommit/${path?.appId}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 获取移动端sqlite文件路径
 * import { getAppGetMobileDbFileUrlByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppGetMobileDbFileUrlByAppIdPathInterface {
  appId: string; // appId
}
export async function getAppGetMobileDbFileUrlByAppId(path: getAppGetMobileDbFileUrlByAppIdPathInterface, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/getMobileDbFileUrl/${path?.appId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 导入版本
 * import { postAppImportVersionByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface postAppImportVersionByAppIdPathInterface {
  appId: string; // appId
}
export async function postAppImportVersionByAppId(path: postAppImportVersionByAppIdPathInterface, data: ImportVersionRequest, config = {}): Promise<ResponseEntityCreateImportAppResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app/importVersion/${path?.appId}`,
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
 * import { getAppImportVersionPreviewByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppImportVersionPreviewByAppIdPathInterface {
  appId: string; // appId
}
export interface getAppImportVersionPreviewByAppIdQueryInterface {
  appPkgUrl: string; // appPkgUrl
}
export async function getAppImportVersionPreviewByAppId(path: getAppImportVersionPreviewByAppIdPathInterface, params: getAppImportVersionPreviewByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntityMergePreviewResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/importVersionPreview/${path?.appId}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getAppInfoById } from "/@/apis/gct-platform/AppController"
 */
export interface getAppInfoByIdPathInterface {
  id: string; // id
}
export async function getAppInfoById(path: getAppInfoByIdPathInterface, config = {}): Promise<ResponseEntityAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/info/${path?.id}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getAppList } from "/@/apis/gct-platform/AppController"
 */
export async function getAppList(config = {}): Promise<ResponseEntityListAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询版本/分支列表
 * import { getAppListBranchByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppListBranchByAppIdPathInterface {
  appId: string; // appId
}
export async function getAppListBranchByAppId(path: getAppListBranchByAppIdPathInterface, config = {}): Promise<ResponseEntityListAppBranchResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/listBranch/${path?.appId}`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 合并详情
 * import { getAppMergeInfoByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppMergeInfoByAppIdPathInterface {
  appId: string; // appId
}
export interface getAppMergeInfoByAppIdQueryInterface {
  id: string; // id
}
export async function getAppMergeInfoByAppId(path: getAppMergeInfoByAppIdPathInterface, params: getAppMergeInfoByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntityMergeLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/merge/info/${path?.appId}`,
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
 * import { getAppMergePageListByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppMergePageListByAppIdPathInterface {
  appId: string; // appId
}
export interface getAppMergePageListByAppIdQueryInterface {
  keyword?: string; // keyword
  pageNo?: number; // pageNo
  pageSize?: number; // pageSize
}
export async function getAppMergePageListByAppId(path: getAppMergePageListByAppIdPathInterface, params: getAppMergePageListByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseMergeLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/merge/page/list/${path?.appId}`,
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
 * import { postAppMergeByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface postAppMergeByAppIdPathInterface {
  appId: string; // appId
}
export async function postAppMergeByAppId(path: postAppMergeByAppIdPathInterface, data: MergeRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app/merge/${path?.appId}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 合并预览
 * import { getAppMergePreviewByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppMergePreviewByAppIdPathInterface {
  appId: string; // appId
}
export interface getAppMergePreviewByAppIdQueryInterface {
  sourceBranchId: string; // sourceBranchId
  targetBranchId: string; // targetBranchId
}
export async function getAppMergePreviewByAppId(path: getAppMergePreviewByAppIdPathInterface, params: getAppMergePreviewByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntityMergePreviewResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/mergePreview/${path?.appId}`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据appid获取应用所有模型
 * import { getAppModelMetaList } from "/@/apis/gct-platform/AppController"
 */
export interface getAppModelMetaListQueryInterface {
  appId?: string; // ...
  createTime?: string; // ...
  createUserId?: string; // ...
  createUserName?: string; // ...
  deleted?: number; // ...
  env?: string; // ...
  fullPath?: string; // ...
  id?: string; // ...
  modifyTime?: string; // ...
  modifyUserId?: string; // ...
  modifyUserName?: string; // ...
  name?: string; // ...
  pageId?: string; // 关联的页面id, 当pageId 不为空时 追加pageId 相关数据
  parentId?: string; // 父节点id , 有则传
  relationId?: string; // ...
  sortNum?: number; // ...
  sysBuiltin?: number; // ...
}
export async function getAppModelMetaList(params: getAppModelMetaListQueryInterface = {}, config = {}): Promise<ResponseEntityListModelCompleteResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/model-meta/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询租户下所有已发布应用(我的应用)
 * import { getAppPageGetListReleasedApp } from "/@/apis/gct-platform/AppController"
 */
export async function getAppPageGetListReleasedApp(config = {}): Promise<ResponseEntityListAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/page/getListReleasedApp`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getAppPageList } from "/@/apis/gct-platform/AppController"
 */
export interface getAppPageListQueryInterface {
  deleted?: number; // 回收状态（0 正常应用 1 回收站应用）
  description?: string; // 应用描述
  endTime?: string; // 结束时间
  id?: string; // 应用标识主键id
  initFailReason?: string; // 错误原因
  name?: string; // 应用名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  searchKey?: string; // 应用名称或者Id
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  tenantId?: string; // 所属租户id
  type?: string; // 类型
}
export async function getAppPageList(params: getAppPageListQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询租户下所有已发布应用 分页列表
 * import { getAppPageListReleasedApp } from "/@/apis/gct-platform/AppController"
 */
export interface getAppPageListReleasedAppQueryInterface {
  deleted?: number; // 回收状态（0 正常应用 1 回收站应用）
  description?: string; // 应用描述
  endTime?: string; // 结束时间
  id?: string; // 应用标识主键id
  initFailReason?: string; // 错误原因
  name?: string; // 应用名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  searchKey?: string; // 应用名称或者Id
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  tenantId?: string; // 所属租户id
  type?: string; // 类型
}
export async function getAppPageListReleasedApp(params: getAppPageListReleasedAppQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/page/listReleasedApp`,
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
 * import { getAppPublishLogInfoByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppPublishLogInfoByAppIdPathInterface {
  appId: string; // appId
}
export interface getAppPublishLogInfoByAppIdQueryInterface {
  branchId: string; // branchId
  publishId: string; // publishId
}
export async function getAppPublishLogInfoByAppId(path: getAppPublishLogInfoByAppIdPathInterface, params: getAppPublishLogInfoByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntityPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/publishLogInfo/${path?.appId}`,
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
 * import { getAppPublishLogPageListByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface getAppPublishLogPageListByAppIdPathInterface {
  appId: string; // 应用id
}
export interface getAppPublishLogPageListByAppIdQueryInterface {
  appEnv?: string; // 环境 test/prod
  pageNo?: number; // 页码
  pageSize?: number; // 每页数据条数
  state?: string; // 状态
}
export async function getAppPublishLogPageListByAppId(path: getAppPublishLogPageListByAppIdPathInterface, params: getAppPublishLogPageListByAppIdQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppPublishLogResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/publishLogPageList/${path?.appId}`,
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
 * import { getAppReportInfos } from "/@/apis/gct-platform/AppController"
 */
export interface getAppReportInfosQueryInterface {
  appId?: string; // app id
  env?: string; // 环境
  type?: boolean; // true:按分类，false:按数据集
}
export async function getAppReportInfos(params: getAppReportInfosQueryInterface = {}, config = {}): Promise<ResponseEntityLinkedHashMapstringListReport['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/report/infos`,
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
 * import { postAppRevertByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface postAppRevertByAppIdPathInterface {
  appId: string; // appId
}
export async function postAppRevertByAppId(path: postAppRevertByAppIdPathInterface, data: RevertRequest, config = {}): Promise<ResponseEntityPublishLogResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app/revert/${path?.appId}`,
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
 * import { postAppSwitchBranchByAppId } from "/@/apis/gct-platform/AppController"
 */
export interface postAppSwitchBranchByAppIdPathInterface {
  appId: string; // appId
}
export async function postAppSwitchBranchByAppId(path: postAppSwitchBranchByAppIdPathInterface, data: SwitchBranchRequest, config = {}): Promise<ResponseEntityVoid['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app/switchBranch/${path?.appId}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 租户下的应用
 * import { getAppTenantApps } from "/@/apis/gct-platform/AppController"
 */
export interface getAppTenantAppsQueryInterface {
  deleted: number; // deleted
  pageNo: number; // pageNo
  pageSize: number; // pageSize
  searchKey?: string; // searchKey
  type?: string; // type
}
export async function getAppTenantApps(params: getAppTenantAppsQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/tenant/apps`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 租户下的我的角色应用
 * import { getAppTenantRoleByRolesApps } from "/@/apis/gct-platform/AppController"
 */
export interface getAppTenantRoleByRolesAppsPathInterface {
  roles: string; // roles
}
export interface getAppTenantRoleByRolesAppsQueryInterface {
  pageNo: number; // pageNo
  pageSize: number; // pageSize
  searchKey?: string; // searchKey
  type?: string; // type
}
export async function getAppTenantRoleByRolesApps(path: getAppTenantRoleByRolesAppsPathInterface, params: getAppTenantRoleByRolesAppsQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseAppResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/tenant/role/${path?.roles}/apps`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 租户下的我的角色应用数量
 * import { getAppTenantRoleByRolesAppsCount } from "/@/apis/gct-platform/AppController"
 */
export interface getAppTenantRoleByRolesAppsCountPathInterface {
  roles: string; // roles
}
export interface getAppTenantRoleByRolesAppsCountQueryInterface {
  searchKey?: string; // searchKey
  type?: string; // type
}
export async function getAppTenantRoleByRolesAppsCount(path: getAppTenantRoleByRolesAppsCountPathInterface, params: getAppTenantRoleByRolesAppsCountQueryInterface = {}, config = {}): Promise<ResponseEntitylong['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/app/tenant/role/${path?.roles}/apps/count`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 文件上传minio
 * import { postAppUploadAppPkg } from "/@/apis/gct-platform/AppController"
 */
export async function postAppUploadAppPkg(data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/app/upload/appPkg`,
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
 * import { putAppById } from "/@/apis/gct-platform/AppController"
 */
export interface putAppByIdPathInterface {
  id: string; // id
}
export async function putAppById(path: putAppByIdPathInterface, data: AppRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/api/app/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}