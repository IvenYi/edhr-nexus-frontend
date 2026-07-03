import type { LocaleType } from '#/config';
import { set } from 'lodash-es';
import defaultLocale from './lang/zh-CN';

declare type Recordable<T = any> = Record<string, T>;
/**
 * 递归属性拼接成key.key.key
 * @param namespace
 * @param data
 * @param result
 * @returns
 */
function propRecursion(namespace = '', data = {}, result = {}) {
  Object.keys(data).forEach((key) => {
    if (Object.prototype.toString.call(data[key]) === '[object Object]') {
      propRecursion(`${namespace}.${key}`, data[key], result);
    } else if (Object.prototype.toString.call(data[key]) === '[object String]') {
      result[`${namespace}.${key}`] = data[key];
    }
  });
  return result;
}
export const defaultLocaleFlat = {
  ...propRecursion('sys', defaultLocale.message.sys, {}),
  ...propRecursion('_kit', defaultLocale.message._kit, {}),
};
console.log(defaultLocale.message.sys);
export const loadLocalePool: LocaleType[] = [];

export function setHtmlPageLang(locale: LocaleType) {
  document.querySelector('html')?.setAttribute('lang', locale);
}

export function setLoadLocalePool(cb: (loadLocalePool: LocaleType[]) => void) {
  cb(loadLocalePool);
}

export function genMessage(langs: Record<string, Record<string, any>>, prefix = 'lang') {
  const obj: Recordable = {};

  Object.keys(langs).forEach((key) => {
    const langFileModule = langs[key].default;
    let fileName = key.replace(`../../${prefix}/`, '').replace(/^\.\//, '');
    const lastIndex = fileName.lastIndexOf('.');
    fileName = fileName.substring(0, lastIndex);
    const keyList = fileName.split('/');
    const moduleName = keyList.shift();
    const objKey = keyList.join('.');

    if (moduleName) {
      if (objKey) {
        set(obj, moduleName, obj[moduleName] || {});
        set(obj[moduleName], objKey, langFileModule);
      } else {
        set(obj, moduleName, langFileModule || {});
      }
    }
  });
  return obj;
}
