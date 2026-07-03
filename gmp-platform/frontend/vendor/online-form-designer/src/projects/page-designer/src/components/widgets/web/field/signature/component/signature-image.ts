import { createWhiteImageWithText } from '/@page-designer/utils';

export function getSignatureImageUrl(url, name) {
  if (url) {
    return `${import.meta.env.VITE_MINIO_PATH}/${url}`;
  } else if (name) {
    return createWhiteImageWithText(name, 240, 136);
  }
}
