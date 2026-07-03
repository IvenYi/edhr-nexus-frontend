import { PlatformType } from "@gct/runtime";

export const isStr = (val: any): val is string => typeof val === 'string';

export const isSrc = (str: string) => str.length > 0 && /(\/|\.)/.test(str);

/**
 * 获取 src 路径，在非开发环境的 pad 端，如果不是 ./ 开头则补充为 ./ 开头
 * @param src - 源路径
 * @returns 处理后的路径，如果格式不正确则返回 null
 */
export const getSrc = (src: string | undefined) => {
  if (isStr(src)) {
    src = src.trim();
    if (isSrc(src)) {
      try {
        console.log('getSrc src:', JSON.stringify(import.meta.env, null, 2));
      } catch (e) {
        console.error('getSrc error:', e);
      }
      // 在非开发环境且为 pad 端，如果不是 ./ 开头，补充为 ./ 开头
      if (!import.meta.env.DEV && gct.platform !== PlatformType.WEB && !src.startsWith('./')) {
        return `./${src}`;
      }
      return src;
    }
  }
  return null;
};

/**
 * Returns `true` if the document or host element
 * has a `dir` set to `rtl`. The host value will always
 * take priority over the root document value.
 */
export const isRTL = (hostEl?: Pick<HTMLElement, 'dir'>) => {
  if (hostEl) {
    if (hostEl.dir !== '') {
      return hostEl.dir.toLowerCase() === 'rtl';
    }
  }
  return document?.dir.toLowerCase() === 'rtl';
};
