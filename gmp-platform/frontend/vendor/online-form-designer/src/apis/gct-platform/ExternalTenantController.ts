import { defHttp } from '@/utils/http/axios';
import { ResponseEntitySetstring, AppLockRequest, ResponseEntitystring, AppDataRequest, DataSourcePageRequest, ResponseEntityPageBaseDataSourceDTO, ResponseEntityListMap, QueryBean, ResponseEntityListMapstringobject, ResponseEntityList消息设置VO, SendEmailMessageRequest, ResponseEntityboolean, SendMessageRequest, ResponseEntityListOrgBaseInfo, ResponseEntityRegexpResponse, ResponseEntityListRegexpResponse, ResponseEntityPageBaseRegexpResponse, RegexpRequest, ResponseEntityTenant, UserSyncFromThirdPartyRequest, ResponseEntityListstring } from './model/index';

/**
 * 获取 appId 下授权用户
 * import { getAppListAppGrantedUserIdExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getAppListAppGrantedUserIdExternalQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function getAppListAppGrantedUserIdExternal(params: getAppListAppGrantedUserIdExternalQueryInterface = {}, config = {}): Promise<ResponseEntitySetstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app/listAppGrantedUserId`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 锁定解锁应用
 * import { postAppLockOrUnlockToPaasExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postAppLockOrUnlockToPaasExternal(data: AppLockRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/lockOrUnlockToPaas`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询已发布应用
 * import { getAppPublishedExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function getAppPublishedExternal(config = {}): Promise<ResponseEntitySetstring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/app/published`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 更改apaas内的应用时同步更改平台的app应用配置信息
 * import { postAppUpdateApaasAppSettingExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postAppUpdateApaasAppSettingExternal(data: AppDataRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/app/updateApaasAppSetting`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页查询
 * import { postDataSourcePageListExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postDataSourcePageListExternal(data: DataSourcePageRequest, config = {}): Promise<ResponseEntityPageBaseDataSourceDTO['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/data-source/page/list`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询数据
 * import { getDataSourceQueryDataExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getDataSourceQueryDataExternalQueryInterface {
  env: string; // env
  key: string; // key
  sql: string; // sql
}
export async function getDataSourceQueryDataExternal(params: getDataSourceQueryDataExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListMap['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/data-source/queryData`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询数据api
 * import { postDataSourceSelectExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface postDataSourceSelectExternalQueryInterface {
  env: string; // env
  key: string; // key
}
export async function postDataSourceSelectExternal(data: QueryBean, params: postDataSourceSelectExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/data-source/select`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询数据源类型
 * import { getDataSourceTypeExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getDataSourceTypeExternalQueryInterface {
  env: string; // env
  key: string; // key
}
export async function getDataSourceTypeExternal(params: getDataSourceTypeExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/data-source/type`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据消息配置类型查询列表 email 邮箱 dingtalk 钉钉 wecom 企业微信 feishu 飞书 system 站内信
 * import { getMsgFindAllByTypeExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getMsgFindAllByTypeExternalQueryInterface {
  type: string; // type
}
export async function getMsgFindAllByTypeExternal(params: getMsgFindAllByTypeExternalQueryInterface = {}, config = {}): Promise<ResponseEntityList消息设置VO['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/msg/findAllByType`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试发送邮箱消息
 * import { postMsgSendEmailMessageExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postMsgSendEmailMessageExternal(data: SendEmailMessageRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/msg/sendEmailMessage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 测试发送企业微信、钉钉、飞书消息
 * import { postMsgSendMessageExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postMsgSendMessageExternal(data: SendMessageRequest, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/msg/sendMessage`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据部门id批量查询部门信息
 * import { postOrgFindAllByIdInExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postOrgFindAllByIdInExternal(data: string[], config = {}): Promise<ResponseEntityListOrgBaseInfo['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/org/findAllByIdIn`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据机构名称全路径查询
 * import { postOrgListExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface postOrgListExternalQueryInterface {
  tenantId: string; // tenantId
}
export async function postOrgListExternal(data: string[], params: postOrgListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListOrgBaseInfo['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/org/list`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据机构名称全路径查询
 * import { getOrgListAllExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function getOrgListAllExternal(config = {}): Promise<ResponseEntityListOrgBaseInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/org/listAll`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询部门负责人
 * import { postOrgPrincipalsExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postOrgPrincipalsExternal(data: string[], config = {}): Promise<array['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/org/principals`,
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
 * import { deleteRegexpDeleteExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface deleteRegexpDeleteExternalQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteRegexpDeleteExternal(params: deleteRegexpDeleteExternalQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.delete(
    {
      url: `/gct-platform/external/api/regexp/delete`,
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
 * import { getRegexpInfoExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getRegexpInfoExternalQueryInterface {
  id: string; // id
}
export async function getRegexpInfoExternal(params: getRegexpInfoExternalQueryInterface = {}, config = {}): Promise<ResponseEntityRegexpResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/regexp/info`,
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
 * import { getRegexpListExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function getRegexpListExternal(config = {}): Promise<ResponseEntityListRegexpResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/regexp/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getRegexpPageListExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getRegexpPageListExternalQueryInterface {
  endTime?: string; // 结束时间
  name?: string; // 正则名称
  pageNo?: number; // 页码
  pageSize?: number; // 分页大小
  sortField?: string; // 排序字段
  sortType?: string; // 排序方式：ASC/DESC， 不传默认 ASC
  startTime?: string; // 开始时间
  value?: string; // 正则值
}
export async function getRegexpPageListExternal(params: getRegexpPageListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityPageBaseRegexpResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/regexp/page/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postRegexpSaveExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postRegexpSaveExternal(data: RegexpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/regexp/save`,
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
 * import { putRegexpUpdateByIdExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface putRegexpUpdateByIdExternalPathInterface {
  id: string; // id
}
export async function putRegexpUpdateByIdExternal(path: putRegexpUpdateByIdExternalPathInterface, data: RegexpRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.put(
    {
      url: `/gct-platform/external/api/regexp/update/${path?.id}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据域名或端口获取租户信息
 * import { getTenantInfoByPortOrDomainExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getTenantInfoByPortOrDomainExternalQueryInterface {
  domain?: string; // domain
  port?: string; // port
}
export async function getTenantInfoByPortOrDomainExternal(params: getTenantInfoByPortOrDomainExternalQueryInterface = {}, config = {}): Promise<ResponseEntityTenant['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/tenant/info/byPortOrDomain`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 根据机构名称全路径查询
 * import { getTenantOrgListExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getTenantOrgListExternalQueryInterface {
  tenantId: string; // tenantId
}
export async function getTenantOrgListExternal(params: getTenantOrgListExternalQueryInterface = {}, config = {}): Promise<ResponseEntityListOrgBaseInfo['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/tenant/org/list`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 从第三方同步用户
 * import { postTenantUserSyncFromThirdPartyExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export async function postTenantUserSyncFromThirdPartyExternal(data: UserSyncFromThirdPartyRequest, config = {}): Promise<ResponseEntityListstring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/tenant/userSyncFromThirdParty`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询人员所在主部门,部门主管
 * import { getUserOrgPrincipalExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface getUserOrgPrincipalExternalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getUserOrgPrincipalExternal(params: getUserOrgPrincipalExternalQueryInterface = {}, config = {}): Promise<string> {
  return defHttp.get(
    {
      url: `/gct-platform/external/api/user/org/principal`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 批量查询人员所在主部门,部门主管
 * import { postUserOrgPrincipalsExternal } from "/@/apis/gct-platform/ExternalTenantController"
 */
export interface postUserOrgPrincipalsExternalQueryInterface {
  tenantId: string; // tenantId
}
export async function postUserOrgPrincipalsExternal(data: string[], params: postUserOrgPrincipalsExternalQueryInterface = {}, config = {}): Promise<array['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/external/api/user/org/principals`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}