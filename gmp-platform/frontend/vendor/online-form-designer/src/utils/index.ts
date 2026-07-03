import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router';
import type { App, Component } from 'vue';

import { unref } from 'vue';
import { isArray, isObject } from '/@/utils/is';
import { cloneDeep, isEqual, mergeWith, unionWith } from 'lodash-es';
// import { useBranch } from '/@/hooks/develop/useBranch';
// const { branchId } = useBranch();

export const noop = () => {};

/**
 * @description:  Set ui mount node
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (node?.parentNode as HTMLElement) ?? document.body;
}

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = '';
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

/**

 递归合并两个对象。
 Recursively merge two objects.
 @param target 目标对象，合并后结果存放于此。The target object to merge into.
 @param source 要合并的源对象。The source object to merge from.
 @returns 合并后的对象。The merged object.
 */
export function deepMerge<T extends object | null | undefined, U extends object | null | undefined>(
  target: T,
  source: U,
): T & U {
  return mergeWith(cloneDeep(target), source, (objValue, srcValue) => {
    if (isObject(objValue) && isObject(srcValue)) {
      return mergeWith(cloneDeep(objValue), srcValue, (prevValue, nextValue) => {
        // 如果是数组，合并数组(去重) If it is an array, merge the array (remove duplicates)
        return isArray(prevValue) ? unionWith(prevValue, nextValue, isEqual) : undefined;
      });
    }
  });
}

export function openWindow(
  url: string,
  opt?: {
    target?: TargetContext | string;
    noopener?: boolean;
    noreferrer?: boolean;
    genUrlData?: object;
    optionStr?: string;
    routePath?: string;
  },
) {
  const {
    target = '_blank',
    noopener = true,
    noreferrer = true,
    genUrlData,
    routePath = '',
  } = opt || {};
  const feature: string[] = [];

  noopener && feature.push('noopener=yes');
  noreferrer && feature.push('noreferrer=yes');
  genUrlData && (url = genUrl(url, genUrlData));
  return window.open(url + routePath, target, feature.join(',') + opt?.optionStr);
}

/**
 * 替换url中的参数，格式为xxx/{aid}/xxx/{pid}/{bid?}
 * @param url
 * @param data
 * @returns
 */
export function genUrl(url: string, data: object) {
  let result = url;
  Object.keys(data).forEach((key) => {
    // if ([undefined, null].includes(data[key])) return;
    result = result.replace(`{${key}}`, data[key] ?? '');
    // 支持参数可选
    result = result.replace(`{${key}?}`, data[key] ?? '');
  });
  // 可选参数移除
  result = result.replace(/\/\{[a-z]+\?\}/g, '');
  return result;
}

// dynamic use hook props
export function getDynamicProps<T extends Record<string, unknown>, U>(props: T): Partial<U> {
  const ret: Recordable = {};

  Object.keys(props).map((key) => {
    ret[key] = unref((props as Recordable)[key]);
  });

  return ret as Partial<U>;
}

export function getRawRoute(route: RouteLocationNormalized): RouteLocationNormalized {
  if (!route) return route;
  const { matched, ...opt } = route;
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path,
        }))
      : undefined) as RouteRecordNormalized[],
  };
}

// https://github.com/vant-ui/vant/issues/8302
type EventShim = {
  new (...args: any[]): {
    $props: {
      onClick?: (...args: any[]) => void;
    };
  };
};

/**重置reactive对象为初始对象的方法 */
export const resetReactiveState = (nowObj: Object, oriObj: Object) => {
  const needHaveKeys = Object.keys(oriObj);
  Object.keys(nowObj).forEach((key) => {
    if (needHaveKeys.includes(key)) {
      nowObj[key] = oriObj[key];
    } else {
      delete nowObj[key];
    }
  });
};
export const swapPosInArr = (arr, index1, index2) => {
  // 确保下标在数组范围内
  if (index1 < 0 || index1 >= arr.length || index2 < 0 || index2 >= arr.length) {
    console.log('下标超出数组范围');
    return;
  }

  // 交换元素
  [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
};

export const deleteAndInsertArr = (arr, deleteIndex, insertIndex) => {
  // 确保下标在数组范围内
  if (deleteIndex < 0 || deleteIndex >= arr.length || insertIndex < 0 || insertIndex > arr.length) {
    console.log('下标超出数组范围');
    return;
  }
  // 删除元素并保存
  const deletedElement = arr.splice(deleteIndex, 1)[0];

  // 插入元素到新的下标位置
  arr.splice(insertIndex, 0, deletedElement);
};

export type WithInstall<T> = T & {
  install(app: App): void;
} & EventShim;

export type CustomComponent = Component & { displayName?: string };

export const withInstall = <T extends CustomComponent>(component: T, alias?: string) => {
  (component as Record<string, unknown>).install = (app: App) => {
    const compName = component.name || component.displayName;
    if (!compName) return;
    app.component(compName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as WithInstall<T>;
};

export const getEnv = () => {
  return /\/web\/|web-single\/|dev-single\/|test-single\//.test(location.pathname) ? 'prod' : 'dev';
};

export function parseBoolean(any) {
  switch (String(any).toLowerCase()) {
    case 'true':
    case '1':
    case 'yes':
    case 'y':
      return true;
    case 'false':
    case '0':
    case 'no':
    case 'n':
      return false;
    default:
      //you could throw an error, but 'undefined' seems a more logical reply
      return Boolean(any);
  }
}
