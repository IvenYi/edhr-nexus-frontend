import qs from 'qs';
/**
 * 请求缓存
 * @param args
 * @param adapter
 * @returns
 */
export function cacheAdapter(args, adapter, noneCache = false) {
  if (noneCache || args?.customApi?.value) return adapter(args);
  const maxAge = 5000;
  const requestKey = typeof args === 'object' ? qs.stringify({ ...args, customApi: null }) : args; // 生成请求Key
  let responsePromise = MemoryCache.get(requestKey); // 从缓存中获取请求key对应的响应对象
  if (!responsePromise) {
    responsePromise = (async () => {
      try {
        return await adapter(args); // 使用默认发送请求
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

class MemoryCache {
  static cachedata = {};
  static set(key: string, value: Promise<any>, maxAge: number) {
    // 保存数据
    this.cachedata[key] = {
      maxAge: maxAge || 0,
      value,
      now: Date.now(),
    };
  }
  static get(key: string) {
    this.reset();
    // 从缓存中获取指定 key 对应的值。
    const cachedItem = this.cachedata[key];
    if (!cachedItem) return null;
    return cachedItem.value;
  }
  static delete(key: string) {
    // 从缓存中删除指定 key 对应的值。
    return delete this.cachedata[key];
  }
  static clear() {
    // 清空已缓存的数据。
    this.cachedata = {};
  }
  /**
   *清空过期的数据
   */
  static reset() {
    for (const key in this.cachedata) {
      const cachedItem = this.cachedata[key];
      if (cachedItem) {
        const isExpired = Date.now() - cachedItem.now > cachedItem.maxAge;
        isExpired && this.delete(key);
      }
    }
  }
}
