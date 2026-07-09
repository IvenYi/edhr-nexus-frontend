import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { createSessionStorage } from '/@/utils/cache';
import { DESIGNER_SESSION_CACHE_KEY } from '/@/enums/cacheEnum';
import { store } from '/@/store';

interface querState {
  aid?: string;
  pid?: string;
  category?: string;
}

const ls = createSessionStorage({ hasEncrypt: false });

export const useQueryStore = defineStore('app-query', () => {
  const query: Ref<querState> = ref({});
  function initQuery() {
    const params = new URLSearchParams(location.search);
    for (const key of params) {
      query.value[key[0]] = key[1];
    }
    ls.set(DESIGNER_SESSION_CACHE_KEY, query.value);
  }

  function setAid(payload) {
    query.value.aid = payload;
  }
  function getAid() {
    return query.value.aid;
  }

  function setPid(payload) {
    query.value.pid = payload;
  }
  function getPid() {
    return query.value.pid;
  }

  function getCategory() {
    return query.value.category;
  }

  return { query, initQuery, setAid, getAid, setPid, getPid, getCategory };
});

export function useQueryStoreWithOut() {
  return useQueryStore(store);
}
