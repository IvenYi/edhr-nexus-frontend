import { _isAndroid } from '@mobile/utils/const';
import androidSdk from './android';
import webSdk from './web';
import type { JSSDKMap } from './type';
import { Environment } from '@mobile/type';

const env = _isAndroid ? Environment.ANDROID : Environment.WEB;

export const JSSDK = {
  run<T extends keyof JSSDKMap>(key: T, ...arg: Parameters<JSSDKMap[T]>) {
    switch (env) {
      case Environment.ANDROID:
        return runCallback(key, androidSdk, arg);

      case Environment.WEB:
        return runCallback(key, webSdk, arg);

      default:
        break;
    }
  },
  get() {},
};

function runCallback(name: string, sdkMap: any, arg: any) {
  const callback = sdkMap[name];
  if (callback) {
    return callback(...arg);
  } else {
    console.error(`${env}不存在${name}`);
  }
}
