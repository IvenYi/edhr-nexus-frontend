import { defHttp } from '@/utils/http/axios';
import { ThirdAppConfigReq, ResponseEntitystring, SmsDto, UserBaseReq, ResponseEntityUserLoginResp, ResponseEntityboolean } from './model/index';

/**
 * 验证第三方平台是否注册正常
 * import { postLoginCheckApp } from "/@/apis/gct-platform/LoginController"
 */
export async function postLoginCheckApp(data: ThirdAppConfigReq, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/login/checkApp`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 短信登录发送短信
 * import { postLoginSendMsg } from "/@/apis/gct-platform/LoginController"
 */
export async function postLoginSendMsg(data: SmsDto, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/login/sendMsg`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 登录api
 * import { postLoginSign } from "/@/apis/gct-platform/LoginController"
 */
export async function postLoginSign(data: UserBaseReq, config = {}): Promise<ResponseEntityUserLoginResp['data']> {
  return defHttp.post(
    {
      url: `/gct-platform/api/login/sign`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 退出登录
 * import { getLoginSignOut } from "/@/apis/gct-platform/LoginController"
 */
export interface getLoginSignOutQueryInterface {
  appId?: string; // 应用id
  clientId?: string; // 应用id
  env?: string; // 应用环境
  platform?: string; // 页面SystemTypeEnum
}
export async function getLoginSignOut(params: getLoginSignOutQueryInterface = {}, config = {}): Promise<ResponseEntitystring['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/login/signOut`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 当前人员登录app时是否有权限
 * import { getLoginUserAppAuth } from "/@/apis/gct-platform/LoginController"
 */
export interface getLoginUserAppAuthQueryInterface {
  appId: string; // 应用id
  clientId: string; // 客户端id
}
export async function getLoginUserAppAuth(params: getLoginUserAppAuthQueryInterface = {}, config = {}): Promise<ResponseEntityboolean['data']> {
  return defHttp.get(
    {
      url: `/gct-platform/api/login/userAppAuth`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}