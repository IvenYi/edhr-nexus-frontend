export function transformUrl(url?: string, { random = true } = {}) {
  if (!url) {
    return '';
  }
  return (
    `${import.meta.env.VITE_MINIO_PATH}${url.startsWith('/') ? '' : '/'}${url}` +
    (random ? `?${Math.random()}` : '')
  );
}
