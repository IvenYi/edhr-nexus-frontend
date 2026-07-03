import { createWhiteImageWithText } from '@gct/runtime';

/**
 * 创建签名图片地址，当不存在图片地址时，返回默认使用 username 生成的 base64 图片地址
 *
 * @export
 * @param {IObject} data
 * @return {*}  {string}
 */
export function createSignatureImage(data: IObject): string {
  if (data.url) {
    return `${gct.env.MINIO_PATH}${data.url}`;
  }

  // 使用 username 或其他文本字段生成 SVG base64 图片
  const text = data.username || '';
  if (text) {
    return createWhiteImageWithText(text, 240, 136);
  }

  return '';
}
