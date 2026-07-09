import { Persistent, BasicKeys } from '/@/utils/cache/persistent';
import { CacheTypeEnum, TOKEN_KEY } from '/@/enums/cacheEnum';
import projectSetting from '/@/settings/projectSetting';
import { setToken } from '@gct-paas/core';

const { permissionCacheType } = projectSetting;
const isLocal = permissionCacheType === CacheTypeEnum.LOCAL;

let _token: string = '';

export function getToken() {
  const token = getAuthCache(TOKEN_KEY);
  if (!_token && token) {
    _token = token as string;
    setToken(_token);
  }
  return token;
}

export function getAuthCache<T>(key: BasicKeys) {
  const fn = isLocal ? Persistent.getLocal : Persistent.getSession;
  return fn(key) as T;
}

export function setAuthCache(key: BasicKeys, value) {
  const fn = isLocal ? Persistent.setLocal : Persistent.setSession;
  return fn(key, value, true);
}

export function clearAuthCache(immediate = true) {
  const fn = isLocal ? Persistent.clearLocal : Persistent.clearSession;
  return fn(immediate);
}

/**
 * 用于 iframe 场景下截取并设置token
 * @returns
 */
export function initTokenFromUrl() {
  const segments = location.href.split('?');
  if (!segments[1]) return;
  const queryParams = new URLSearchParams(segments[1]);
  const token = queryParams.get('token');
  token && setAuthCache(TOKEN_KEY, token);
}
