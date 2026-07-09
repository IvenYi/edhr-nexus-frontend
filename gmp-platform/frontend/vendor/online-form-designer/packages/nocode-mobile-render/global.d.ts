/*
 * @Author: wangming
 * @Date: 2022-06-09 15:41:04
 * @LastEditors: wangming
 * @LastEditTime: 2022-06-14 12:55:38
 * @FilePath: /vant-app/src/axios.d.ts
 * @Description:
 */
import { type i18n } from 'vue-i18n';
import { Router } from 'vue-router';
export {};
declare module 'axios' {
  interface AxiosRequestConfig {
    joinParamsToUrl?: boolean;
  }
}

declare global {
  const $t: i18n;
  const ___router: Router;
  const __APP_VERSION__ = string;
  type ArrayType<T> = T extends (infer R)[] ? R : never;
  type ReturnPromiseType<T extends (...args: any[]) => any> = T extends (
    ...args: any[]
  ) => Promise<infer R>
    ? R
    : never;
}
declare module 'axios' {
  interface AxiosRequestConfig {
    useCache?: boolean;
  }
}
