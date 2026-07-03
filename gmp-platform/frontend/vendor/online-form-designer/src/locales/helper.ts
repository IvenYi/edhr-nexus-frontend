import type { LocaleType } from '/#/config';

import { set } from 'lodash-es';

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
    let fileName = key.replace(`./${prefix}/`, '').replace(/^\.\//, '');
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

const defaultLocaleModules = import.meta.glob<true, string, any>('./lang/zh-CN/**/*.ts', {
  eager: true,
});
const defaultLocaleMessage = genMessage(defaultLocaleModules, 'lang/zh-CN');

export const defaultLocaleFlat = {
  ...propRecursion('sys', defaultLocaleMessage.sys, {}),
  ...propRecursion('_kit', defaultLocaleMessage._kit, {}),
};
