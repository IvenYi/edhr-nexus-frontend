import request from '@mobile/utils/request';
import type { ResponseEntitySysConfigResponse, SysConfigRequest, ResponseEntitystring, PlatformBaseConfig, ResponseEntityCardLoginConfig, DingTalkConfig, MailConfig, FeiShuConfig, ResponseEntityListSysConfigResponse, AuthConfig, OrgConfig, SecurityConfig, ResponseEntityTenantConfig, ResponseEntityListUserFieldMeta, WXWorkConfig } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 应用全局配置设置 查询
 * import { getPlatAppGlobalInfoByAppId } from "/@/apis/gct-platform/PlatformConfigController"
 */
export interface getPlatAppGlobalInfoByAppIdPathInterface {
  appId: string; // appId
}
export async function getPlatAppGlobalInfoByAppId(path: getPlatAppGlobalInfoByAppIdPathInterface, config:AxiosRequestConfig = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/app/global/info/${path?.appId}`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 应用全局配置设置 保存/更新
 * import { postPlatAppGlobalByAppId } from "/@/apis/gct-platform/PlatformConfigController"
 */
export interface postPlatAppGlobalByAppIdPathInterface {
  appId: string; // appId
}
export async function postPlatAppGlobalByAppId(path: postPlatAppGlobalByAppIdPathInterface, data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/app/global/${path?.appId}`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 基础设置 保存/更新
 * import { postPlatBase } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatBase(data: PlatformBaseConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/base`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询刷卡登录是否启用
 * import { getPlatCardLoginCfg } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatCardLoginCfg(config:AxiosRequestConfig = {}): Promise<ResponseEntityCardLoginConfig['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/card/login/cfg`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 钉钉设置 保存/更新
 * import { postPlatDingtalk } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatDingtalk(data: DingTalkConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/dingtalk`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 邮件 保存/更新
 * import { postPlatEmail } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatEmail(data: MailConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/email`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 飞书设置 保存/更新
 * import { postPlatFeishu } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatFeishu(data: FeiShuConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/feishu`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 全局禁用设计器
 * import { getPlatGlobalDisabledDevelop } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatGlobalDisabledDevelop(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/global/disabled/develop`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 详情
 * import { getPlatInfo } from "/@/apis/gct-platform/PlatformConfigController"
 */
export interface getPlatInfoQueryInterface {
  configEnum: string; // 配置枚举(BASE_CFG/基础设置,THEME_CFG/主题设置,LOGIN_CFG/登录设置,MARK_CFG/水印设置,SECURITY_CFG/安全设置,ORG_CFG/组织设置)
}
export async function getPlatInfo(params: getPlatInfoQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/info`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 配置列表
 * import { getPlatList } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatList(config:AxiosRequestConfig = {}): Promise<ResponseEntityListSysConfigResponse['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/list`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 登录设置 保存/更新
 * import { postPlatLogin } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatLogin(data: AuthConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/login`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 组织设置 保存/更新
 * import { postPlatOrg } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatOrg(data: OrgConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/org`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 安全设置 保存/更新
 * import { postPlatSecurity } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatSecurity(data: SecurityConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/security`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 查询租户配置
 * import { getPlatTenantCfg } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatTenantCfg(config:AxiosRequestConfig = {}): Promise<ResponseEntityTenantConfig['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/tenant/cfg`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 禁用设计器
 * import { getPlatTenantDisabledDevelop } from "/@/apis/gct-platform/PlatformConfigController"
 */
export interface getPlatTenantDisabledDevelopQueryInterface {
  tenantId: string; // 租户ID
}
export async function getPlatTenantDisabledDevelop(params: getPlatTenantDisabledDevelopQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/tenant/disabled/develop`,
      method: 'get',
      params,
      ...config,
    },
  );
}

/**
 * 主题设置 保存/更新
 * import { postPlatTheme } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatTheme(data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/theme`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 企微证书文件上传
 * import { postPlatUploadCertFile } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatUploadCertFile(data: undefined, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/uploadCertFile`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 人员类型导入重复数据 辅助唯一值字段
 * import { getPlatUserField } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatUserField(config:AxiosRequestConfig = {}): Promise<ResponseEntityListUserFieldMeta['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/user/field`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 查询平台版本
 * import { getPlatVersion } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatVersion(config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/version`,
      method: 'get',
      ...config,
    },
  );
}

/**
 * 水印设置 保存/更新
 * import { postPlatWatermark } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatWatermark(data: SysConfigRequest, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/watermark`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 企业微信设置 保存/更新
 * import { postPlatWxwork } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatWxwork(data: WXWorkConfig, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/plat/wxwork`,
      method: 'post',
      data,
      ...config,
    },
  );
}