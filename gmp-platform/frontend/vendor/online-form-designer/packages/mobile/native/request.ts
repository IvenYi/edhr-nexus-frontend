/*
 * @Author: wangming
 * @Date: 2022-06-02 17:10:08
 * @LastEditors: wangming
 * @LastEditTime: 2022-07-13 11:35:22
 * @FilePath: /hanma-paas-mobile-fed/Users/wm/瀚川/hanma-app-platform/vant-app/src/utils/request.ts
 * @Description:
 */
import axios, { AxiosError } from 'axios';
import { showToast } from 'vant';
import { GctNative } from './native';

const request = axios.create({
  timeout: 20000,
  headers: {
    source: import.meta.env.VITE_APP_ENV === 'ipad' ? 504 : 502,
    Env: 'prod',
  },
});
request.defaults.adapter = async (config) => {
  return GctNative.HTTP.request(config);
};
// 异常拦截处理器
const errorHandler = (error: AxiosError) => {
  if (error?.response?.status === 401) {
    showToast('登录信息失效，请重新登录');
  } else {
    showToast('网络异常，请稍后再试');
  }
  return Promise.reject(error);
};
request.interceptors.request.use((config) => {
  config.headers['App-Tag'] = '__platform__';
  return config;
}, errorHandler);

request.interceptors.response.use((response) => {
  if (response.data.code === 200) {
    return response.data.data;
  } else {
    const { errorMessageMode } = response?.config || {};
    if (errorMessageMode !== 'none') {
      showToast(response.data.message);
    }
  }
  return Promise.reject(response.data);
}, errorHandler);

export default request;
