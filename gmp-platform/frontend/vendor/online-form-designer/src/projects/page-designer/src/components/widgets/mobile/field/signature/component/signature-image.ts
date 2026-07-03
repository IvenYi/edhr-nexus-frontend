import { createWhiteImageWithText } from '/@page-designer/utils';
import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
export function getSignatureImageUrl(url, name) {
  if (url) {
    return `${MOBILE_MINIO_PATH.value}${url}`;
  } else if (name) {
    return createWhiteImageWithText(name, 240, 136);
  }
}
