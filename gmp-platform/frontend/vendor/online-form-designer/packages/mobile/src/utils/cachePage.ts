import { ref, toRef } from 'vue';

const CACHES = ref<{ [key: string]: CacheConfig }>({});

export function usePageCaches() {
  const pageCaches = toRef(() =>
    Object.values(CACHES.value)
      .filter((i) => i.keepAlive)
      .map((i) => i.hash),
  );

  function setPageKey({ linkPage, hash, keepAlive }: PageConfig) {
    CACHES.value[hash] = {
      linkPage,
      hash,
      keepAlive,
    };
  }
  function clearAll() {
    CACHES.value = {};
  }
  function clearPageKey(key: string) {
    delete CACHES.value[key];
  }
  function has(key: string) {
    // console.log(key);
    return !!CACHES.value[key];
  }
  return { pageCaches, setPageKey, clearAll, clearPageKey, has };
}
interface PageConfig {
  /**页面key */
  linkPage: string;
  /**页面标识 */
  hash: string;
  /**是否缓存 */
  keepAlive: boolean;
}
interface CacheConfig {
  /**页面key */
  linkPage: string;
  /**页面标识 */
  hash: string;
  /**是否缓存 */
  keepAlive: boolean;
}
