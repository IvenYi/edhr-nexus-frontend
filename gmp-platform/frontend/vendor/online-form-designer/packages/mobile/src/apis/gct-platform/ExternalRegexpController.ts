import request from '@mobile/utils/request';
import type { ResponseEntityListApp, ResponseEntityListstring, ResponseEntitystring, ResponseEntitySetstring, AppLockRequest, AppDataRequest, ResponseEntityListMap, DataSourceUpdateRequest, ResponseEntityint, ResponseEntityDatasourceExtDTO, DataSourcePageRequest, ResponseEntityPageBaseDataSourceDTO, QueryBean, ResponseEntityListMapstringobject, ResponseEntityList消息设置VO, SendEmailMessageRequest, ResponseEntityboolean, SendMessageRequest, ResponseEntityListOrgBaseInfo, ResponseEntityOrg, ResponseEntityRegexpResponse, ResponseEntityListRegexpResponse, ResponseEntityPageBaseRegexpResponse, RegexpRequest, ResponseEntityTenant, UserSyncFromThirdPartyRequest } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 查询租户下所有的app
 * import { getAppFindAllByTenantId } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function getAppFindAllByTenantId(config:AxiosRequestConfig = {}): Promise<ResponseEntityListApp['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/findAllByTenantId`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 获取 app的被共享应用
 * import { getAppGetDestBySource } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getAppGetDestBySourceQueryInterface {
  appId: string; // appId
}
export async function getAppGetDestBySource(params: getAppGetDestBySourceQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/getDestBySource`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取 app授权的源应用
 * import { getAppGetSourceByDest } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getAppGetSourceByDestQueryInterface {
  appId: string; // appId
}
export async function getAppGetSourceByDest(params: getAppGetSourceByDestQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/getSourceByDest`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 获取 appId 下授权用户
 * import { getAppListAppGrantedUserId } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getAppListAppGrantedUserIdQueryInterface {
  appId: string; // appId
  env: string; // env
}
export async function getAppListAppGrantedUserId(params: getAppListAppGrantedUserIdQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySetstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/listAppGrantedUserId`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 锁定解锁应用
 * import { postAppLockOrUnlockToPaas } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postAppLockOrUnlockToPaas(data: AppLockRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/lockOrUnlockToPaas`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询已发布生产环境的应用
 * import { getAppProdPublished } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function getAppProdPublished(config:AxiosRequestConfig = {}): Promise<ResponseEntitySetstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/prodPublished`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 查询已发布应用
 * import { getAppPublished } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function getAppPublished(config:AxiosRequestConfig = {}): Promise<ResponseEntitySetstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/published`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 查询已发布验证环境的应用
 * import { getAppTestPublished } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function getAppTestPublished(config:AxiosRequestConfig = {}): Promise<ResponseEntitySetstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/testPublished`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 更改apaas内的应用时同步更改平台的app应用配置信息
 * import { postAppUpdateApaasAppSetting } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postAppUpdateApaasAppSetting(data: AppDataRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/app/updateApaasAppSetting`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询数据-iPaaS
 * import { getDataSourceExecuteSelect } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getDataSourceExecuteSelectQueryInterface {
  env: string; // env
  key: string; // key
  sql: string; // sql
}
export async function getDataSourceExecuteSelect(params: getDataSourceExecuteSelectQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMap['data']> {
  return request(
    {
      url: `/gct-platform/external/api/data-source/executeSelect`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 执行DML、DDL-iPaaS
 * import { postDataSourceExecuteUpdate } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postDataSourceExecuteUpdate(data: DataSourceUpdateRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityint['data']> {
  return request(
    {
      url: `/gct-platform/external/api/data-source/executeUpdate`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据key和env查询数据源
 * import { getDataSourceFindByKeyAndEnv } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getDataSourceFindByKeyAndEnvQueryInterface {
  env: string; // env
  key: string; // key
}
export async function getDataSourceFindByKeyAndEnv(params: getDataSourceFindByKeyAndEnvQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityDatasourceExtDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/data-source/findByKeyAndEnv`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 分页查询
 * import { postDataSourcePageList } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postDataSourcePageList(data: DataSourcePageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseDataSourceDTO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/data-source/page/list`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询数据
 * import { getDataSourceQueryData } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getDataSourceQueryDataQueryInterface {
  env: string; // env
  key: string; // key
  sql: string; // sql
}
export async function getDataSourceQueryData(params: getDataSourceQueryDataQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMap['data']> {
  return request(
    {
      url: `/gct-platform/external/api/data-source/queryData`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 查询数据api
 * import { postDataSourceSelect } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface postDataSourceSelectQueryInterface {
  env: string; // env
  key: string; // key
}
export async function postDataSourceSelect(data: QueryBean, params: postDataSourceSelectQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListMapstringobject['data']> {
  return request(
    {
      url: `/gct-platform/external/api/data-source/select`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 查询数据源类型
 * import { getDataSourceType } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getDataSourceTypeQueryInterface {
  env: string; // env
  key: string; // key
}
export async function getDataSourceType(params: getDataSourceTypeQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/data-source/type`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据消息配置类型查询列表 email 邮箱 dingtalk 钉钉 wecom 企业微信 feishu 飞书 system 站内信
 * import { getMsgFindAllByType } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getMsgFindAllByTypeQueryInterface {
  type: string; // type
}
export async function getMsgFindAllByType(params: getMsgFindAllByTypeQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityList消息设置VO['data']> {
  return request(
    {
      url: `/gct-platform/external/api/msg/findAllByType`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 测试发送邮箱消息
 * import { postMsgSendEmailMessage } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postMsgSendEmailMessage(data: SendEmailMessageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/external/api/msg/sendEmailMessage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 测试发送企业微信、钉钉、飞书消息
 * import { postMsgSendMessage } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postMsgSendMessage(data: SendMessageRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/external/api/msg/sendMessage`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 根据部门id批量查询部门信息
 * import { postOrgFindAllByIdIn } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postOrgFindAllByIdIn(data: undefined[], config:AxiosRequestConfig = {}): Promise<ResponseEntityListOrgBaseInfo['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org/findAllByIdIn`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 详情
 * import { getOrgInfoById } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getOrgInfoByIdPathInterface {
  id: string; // id
}
export async function getOrgInfoById(path: getOrgInfoByIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntityOrg['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org/info/${path?.id}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 根据机构名称全路径查询
 * import { postOrgList } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface postOrgListQueryInterface {
  tenantId: string; // tenantId
}
export async function postOrgList(data: undefined[], params: postOrgListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOrgBaseInfo['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org/list`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}

/**
 * 根据机构名称全路径查询
 * import { getOrgListAll } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function getOrgListAll(config:AxiosRequestConfig = {}): Promise<ResponseEntityListOrgBaseInfo['data']> {
  return request(
    {
      url: `/gct-platform/external/api/org/listAll`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 查询部门负责人
 * import { postOrgPrincipals } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postOrgPrincipals(data: undefined[], config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/external/api/org/principals`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 删除
 * import { deleteRegexpDelete } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface deleteRegexpDeleteQueryInterface {
  ids: string; // 删除的id，多个按','分割
}
export async function deleteRegexpDelete(params: deleteRegexpDeleteQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/regexp/delete`,
      method: 'delete',
      params,
joinParamsToUrl: true,
 ...config,
    },
  );
}

/**
 * 详情
 * import { getRegexpInfo } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getRegexpInfoQueryInterface {
  id: string; // id
}
export async function getRegexpInfo(params: getRegexpInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityRegexpResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/regexp/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 列表
 * import { getRegexpList } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function getRegexpList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListRegexpResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/regexp/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 分页列表
 * import { getRegexpPageList } from "/@/apis/gct-platform/ExternalRegexpController"
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
export async function getRegexpPageList(params: getRegexpPageListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityPageBaseRegexpResponse['data']> {
  return request(
    {
      url: `/gct-platform/external/api/regexp/page/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 保存
 * import { postRegexpSave } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postRegexpSave(data: RegexpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/regexp/save`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 修改
 * import { putRegexpUpdateById } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface putRegexpUpdateByIdPathInterface {
  id: string; // id
}
export async function putRegexpUpdateById(path: putRegexpUpdateByIdPathInterface, data: RegexpRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/regexp/update/${path?.id}`,
      method: 'put',
      data,
      ...config,
    },
  );
}

/**
 * 根据域名或端口获取租户信息
 * import { getTenantInfoByPortOrDomain } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getTenantInfoByPortOrDomainQueryInterface {
  domain?: string; // domain
  port?: string; // port
}
export async function getTenantInfoByPortOrDomain(params: getTenantInfoByPortOrDomainQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityTenant['data']> {
  return request(
    {
      url: `/gct-platform/external/api/tenant/info/byPortOrDomain`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 根据机构名称全路径查询
 * import { getTenantOrgList } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getTenantOrgListQueryInterface {
  tenantId: string; // tenantId
}
export async function getTenantOrgList(params: getTenantOrgListQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityListOrgBaseInfo['data']> {
  return request(
    {
      url: `/gct-platform/external/api/tenant/org/list`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 从第三方同步用户
 * import { postTenantUserSyncFromThirdParty } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export async function postTenantUserSyncFromThirdParty(data: UserSyncFromThirdPartyRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntityListstring['data']> {
  return request(
    {
      url: `/gct-platform/external/api/tenant/userSyncFromThirdParty`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询人员所在主部门,部门主管
 * import { getUserOrgPrincipal } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface getUserOrgPrincipalQueryInterface {
  tenantId: string; // tenantId
  userId: string; // userId
}
export async function getUserOrgPrincipal(params: getUserOrgPrincipalQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/external/api/user/org/principal`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 批量查询人员所在主部门,部门主管
 * import { postUserOrgPrincipals } from "/@/apis/gct-platform/ExternalRegexpController"
 */
export interface postUserOrgPrincipalsQueryInterface {
  tenantId: string; // tenantId
}
export async function postUserOrgPrincipals(data: undefined[], params: postUserOrgPrincipalsQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<any> {
  return request(
    {
      url: `/gct-platform/external/api/user/org/principals`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}