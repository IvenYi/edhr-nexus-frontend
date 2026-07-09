/*
 * @Author: wangming
 * @Date: 2022-06-02 17:10:08
 * @LastEditors: wangming
 * @LastEditTime: 2022-07-13 11:35:22
 * @FilePath: /hanma-paas-mobile-fed/Users/wm/瀚川/hanma-app-platform/vant-app/src/utils/request.ts
 * @Description:
 */
import axios, { AxiosError } from 'axios';
import { getAid } from '@mobile/stores/sessionHooks';
import {
  AccessToken,
  appLoginOut,
  runAutoLogin,
  CurrentTenant,
  getBranchId,
  getIsMobileRender,
} from '@mobile/stores/loginHooks';
import { showToast } from 'vant';
import { serverAddress } from '../stores/sessionHooks';
import { _isAndroid } from '@mobile/utils/const';
import { cacheAdapter } from './cacheAdapter';
import { getEnvCode } from './useEnv';
import { TimeZone } from '@mobile/stores/timeZone';
import { useAppStore } from '@mobile/stores/useAppStore';
import { getTenant } from '@gct-paas/core';
import { RequestEnum } from '/@/enums/httpEnum';
import { useEnv } from '@mobile/utils/useEnv';

const { isSandbox } = useEnv();

const request = axios.create({
  timeout: 20000,
  headers: {
    source: import.meta.env.VITE_APP_ENV === 'mobile' ? 502 : 504,
  },
});
if (_isAndroid) {
  request.defaults.adapter = cacheAdapter;
}

// 异常拦截处理器
const errorHandler = async (error: AxiosError) => {
  if (error?.response?.status === 401) {
    //自动登录
    try {
      const uslogin = await runAutoLogin();
      if (uslogin && error.config) {
        error.config.headers['Token'] = AccessToken.value;
        return request(error.config as any);
      }
    } catch (error) {}
    showToast('登录信息失效，请重新登录');
    appLoginOut();
  } else if (error?.response?.status === 403) {
  } else if (error?.response?.status === 510) {
    if (isSandbox.value) {
      window.___router.replace('/notFound');
    }
  } else {
    showToast('网络异常，请稍后再试');
  }

  return Promise.reject(error);
};
request.interceptors.request.use((config) => {
  const isMobileRender = getIsMobileRender();
  const branchId = getBranchId();
  config.baseURL = serverAddress.value;
  config.headers['Tenant-Id'] = CurrentTenant.value?.id || getTenant();
  const appStore = useAppStore();
  if (config.url?.includes('gct-apaas') || appStore.getInApp) {
    console.log(getAid.value);
    config.headers['App-Tag'] = getAid.value;
    config.headers['Module'] = 'TENANT_CENTER';
  } else {
    config.headers['App-Tag'] = '__platform__';
  }
  config.headers['Timezone'] = TimeZone.value;
  if (!config.headers['Token']) {
    config.headers['Token'] = AccessToken.value;
  }
  if (!config.headers['Env']) {
    config.headers['Env'] = config?.transferToConfig?.headers?.Env || getEnvCode();
  }
  // Branch-Id
  if (!config.headers['Branch-Id'] && branchId && config.headers['Env'] === 'dev') {
    config.headers['Branch-Id'] = branchId;
  }
  isMobileRender && (config.headers['Is-Preview'] = true);
  return config;
}, errorHandler);

request.interceptors.response.use((response) => {
  if (response.data.code === 200) {
    return response.data.data;
  } else {
    // console.log(response);
    const { errorMessageMode } = response.config || {};
    const { subMessage, message, subCode, data } = response.data;
    if (errorMessageMode === 'none' || subCode === 'sys.plat.api.pass.failure.over.max_times') {
    } else if (subMessage || message) {
      showToast({ message: subMessage || message, zIndex: 3000 });
    }
  }
  return Promise.reject(response?.data || response);
}, errorHandler);

export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = '';
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

export default request;
