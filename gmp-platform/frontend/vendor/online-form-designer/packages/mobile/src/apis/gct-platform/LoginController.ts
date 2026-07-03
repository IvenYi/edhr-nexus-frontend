import request from '@mobile/utils/request';
import type { ThirdAppConfigReq, ResponseEntitystring, SmsDto, UserBaseReq, ResponseEntityUserLoginResp, ResponseEntityboolean } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 验证第三方平台是否注册正常
 * import { postLoginCheckApp } from "/@/apis/gct-platform/LoginController"
 */
export async function postLoginCheckApp(data: ThirdAppConfigReq, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/login/checkApp`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 短信登录发送短信
 * import { postLoginSendMsg } from "/@/apis/gct-platform/LoginController"
 */
export async function postLoginSendMsg(data: SmsDto, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/login/sendMsg`,
      method: 'post',
      data,
      ...config,
    },
  );
}

/**
 * 登录api
 * import { postLoginSign } from "/@/apis/gct-platform/LoginController"
 */
export async function postLoginSign(data: UserBaseReq, config:AxiosRequestConfig = {}): Promise<ResponseEntityUserLoginResp['data']> {
  return request(
    {
      url: `/gct-platform/api/login/sign`,
      method: 'post',
      data,
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
export async function getLoginSignOut(params: getLoginSignOutQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntitystring['data']> {
  return request(
    {
      url: `/gct-platform/api/login/signOut`,
      method: 'get',
      params,
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
export async function getLoginUserAppAuth(params: getLoginUserAppAuthQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityboolean['data']> {
  return request(
    {
      url: `/gct-platform/api/login/userAppAuth`,
      method: 'get',
      params,
      ...config,
    },
  );
}