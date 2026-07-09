/*
 * @Author: wangming
 * @Date: 2021-09-23 15:55:34
 * @LastEditors: wangming
 * @LastEditTime: 2022-03-18 13:18:24
 * @FilePath: /hanma-application-designer-fed/src/utils/cacheAdapter.js
 * @Description: 接口适配器
 */
import { GctNative } from '@native/index';
import type { InternalAxiosRequestConfig } from 'axios';
import { SqlitePage } from '@mobile/utils/sqlite_page';

function adapter(config: InternalAxiosRequestConfig) {
  if (config.url === '/gct-apaas/api/mobile-page/info') {
    return SqlitePage.getPageDb(config.params.id);
  } else {
    return GctNative.HTTP.request(config);
  }
}

export function cacheAdapter(config: InternalAxiosRequestConfig) {
  const maxAge = 3000;
  const useCache = config.useCache;
  if (!useCache) return adapter(config);
  const requestKey = getReqKey(config); // 生成请求Key
  let responsePromise = MemoryCache.get(requestKey); // 从缓存中获取请求key对应的响应对象
  if (!responsePromise) {
    responsePromise = (async () => {
      try {
        return await adapter(config); // 使用默认的xhrAdapter发送请求
      } catch (reason) {
        MemoryCache.delete(requestKey);
        throw reason;
      }
    })();
    MemoryCache.set(requestKey, responsePromise, maxAge); // 保存请求返回的响应对象
    return responsePromise; // 返回已保存的响应对象
  }
  return responsePromise;
}

const MemoryCache = {
  cachedata: {},
  set(key: string, value: Promise<any>, maxAge: number) {
    // 保存数据
    this.cachedata[key] = {
      maxAge: maxAge || 0,
      value,
      now: Date.now(),
    };
  },
  get(key: string) {
    // 从缓存中获取指定 key 对应的值。
    const cachedItem = this.cachedata[key];
    if (!cachedItem) return null;
    const isExpired = Date.now() - cachedItem.now > cachedItem.maxAge;
    isExpired && this.delete(key);
    return isExpired ? null : cachedItem.value;
  },
  delete(key: string) {
    // 从缓存中删除指定 key 对应的值。
    return delete this.cachedata[key];
  },
  clear() {
    // 清空已缓存的数据。
    this.cachedata = {};
  },
};
/**
 * api转化唯一key
 * @param {*} config
 * @returns
 */
function getReqKey(config: InternalAxiosRequestConfig) {
  const { method, url, params } = config;
  let { data } = config;
  if (typeof data === 'object') {
    try {
      data = JSON.stringify(data);
    } catch (error) {}
  }
  return [method, url, JSON.stringify(params), data].join('&');
}
