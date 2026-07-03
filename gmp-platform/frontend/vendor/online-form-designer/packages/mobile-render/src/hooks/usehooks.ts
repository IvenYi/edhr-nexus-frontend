/*
 * @Author: wangming
 * @Date: 2022-06-10 11:35:10
 * @LastEditors: wangming
 * @LastEditTime: 2022-06-20 17:13:30
 * @FilePath: /vant-app/src/stores/session.ts
 * @Description:
 */
import { useLocalStorage } from '@vueuse/core';
import { GlobalParamEnum } from '../constant';
import { computed } from 'vue';
const GCT_SELECT_ID = useLocalStorage('GCT_APP_GlobalCache', {});

/**
 * app全局缓存
 * @param key  aid_userId
 * @returns
 */
export const useGctSelect = (key: string) => {
  const cacheMap = computed<object>({
    get() {
      return GCT_SELECT_ID.value[key] || {};
    },
    set(value) {
      GCT_SELECT_ID.value[key] = value;
    },
  });
  const selectID = computed<string>({
    get() {
      return cacheMap.value[GlobalParamEnum.SELECT_ID];
    },
    set(value) {
      if (cacheMap.value[GlobalParamEnum.SELECT_ID]) {
        cacheMap.value[GlobalParamEnum.SELECT_ID] = value;
      } else {
        cacheMap.value = { ...cacheMap.value, [GlobalParamEnum.SELECT_ID]: value };
      }
    },
  });
  return { selectID, cacheMap };
};
