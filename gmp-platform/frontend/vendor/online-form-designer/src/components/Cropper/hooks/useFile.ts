let urlCacheMap: Record<string, { random: number; timestamp: number }> = {};

export function transformUrl(url, { random = true } = {}) {
  if (!url) {
    return '/404.png';
  }

  const url2 = `${import.meta.env.VITE_MINIO_PATH}${url.startsWith('/') ? '' : '/'}${url}`;
  // 无需缓存
  if (!random) return url2;

  // 缓存时长 60s
  if (urlCacheMap[url] && Date.now() - urlCacheMap[url].timestamp < 60 * 1000) {
    return `${url2}?${urlCacheMap[url].random}`;
  }

  // 清空缓存
  if (Object.keys(urlCacheMap).length > 100) urlCacheMap = {};

  const r = Math.random();
  urlCacheMap[url] = {
    random: r,
    timestamp: Date.now(),
  };
  return `${url2}?${r}`;
}

export function fileUrlParser(url) {
  if (!url) {
    return url;
  }
  return `${import.meta.env.VITE_MINIO_PATH}${url.startsWith('/') ? '' : '/'}${url}`;
}
