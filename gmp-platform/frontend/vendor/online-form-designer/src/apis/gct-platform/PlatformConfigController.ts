import { defHttp } from '@/utils/http/axios';
import { ResponseEntitySysConfigResponse, SysConfigRequest, ResponseEntitystring, PlatformBaseConfig, ResponseEntityCardLoginConfig, DingTalkConfig, MailConfig, FeiShuConfig, ResponseEntityListSysConfigResponse, AuthConfig, OrgConfig, SecurityConfig, ResponseEntityTenantConfig, ResponseEntityListUserFieldMeta, WXWorkConfig } from './model/index';

/**
 * 应用全局配置设置 查询
 * import { getPlatAppGlobalInfoByAppId } from "/@/apis/gct-platform/PlatformConfigController"
 */
export interface getPlatAppGlobalInfoByAppIdPathInterface {
  appId: string; // appId
}
export async function getPlatAppGlobalInfoByAppId(path: getPlatAppGlobalInfoByAppIdPathInterface, config = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/app/global/info/${path?.appId}`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function postPlatAppGlobalByAppId(path: postPlatAppGlobalByAppIdPathInterface, data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/app/global/${path?.appId}`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 基础设置 保存/更新
 * import { postPlatBase } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatBase(data: PlatformBaseConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/base`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询刷卡登录是否启用
 * import { getPlatCardLoginCfg } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatCardLoginCfg(config = {}): Promise<ResponseEntityCardLoginConfig['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/card/login/cfg`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 钉钉设置 保存/更新
 * import { postPlatDingtalk } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatDingtalk(data: DingTalkConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/dingtalk`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 邮件 保存/更新
 * import { postPlatEmail } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatEmail(data: MailConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/email`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 飞书设置 保存/更新
 * import { postPlatFeishu } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatFeishu(data: FeiShuConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/feishu`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 全局禁用设计器
 * import { getPlatGlobalDisabledDevelop } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatGlobalDisabledDevelop(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/global/disabled/develop`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPlatInfo(params: getPlatInfoQueryInterface = {}, config = {}): Promise<ResponseEntitySysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/info`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 配置列表
 * import { getPlatList } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatList(config = {}): Promise<ResponseEntityListSysConfigResponse['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/list`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 登录设置 保存/更新
 * import { postPlatLogin } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatLogin(data: AuthConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/login`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 组织设置 保存/更新
 * import { postPlatOrg } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatOrg(data: OrgConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/org`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 安全设置 保存/更新
 * import { postPlatSecurity } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatSecurity(data: SecurityConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/security`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询租户配置
 * import { getPlatTenantCfg } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatTenantCfg(config = {}): Promise<ResponseEntityTenantConfig['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/tenant/cfg`,
    },
    {
      joinTenantIdToHeader: true,
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
export async function getPlatTenantDisabledDevelop(params: getPlatTenantDisabledDevelopQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/tenant/disabled/develop`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 主题设置 保存/更新
 * import { postPlatTheme } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatTheme(data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/theme`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 企微证书文件上传
 * import { postPlatUploadCertFile } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatUploadCertFile(data: any, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/uploadCertFile`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 人员类型导入重复数据 辅助唯一值字段
 * import { getPlatUserField } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatUserField(config = {}): Promise<ResponseEntityListUserFieldMeta['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/user/field`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 查询平台版本
 * import { getPlatVersion } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function getPlatVersion(config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/plat/version`,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 水印设置 保存/更新
 * import { postPlatWatermark } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatWatermark(data: SysConfigRequest, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/watermark`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 企业微信设置 保存/更新
 * import { postPlatWxwork } from "/@/apis/gct-platform/PlatformConfigController"
 */
export async function postPlatWxwork(data: WXWorkConfig, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/plat/wxwork`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}