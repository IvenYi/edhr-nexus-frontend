import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { store } from '/@/store';

interface querState {
  aid?: string;
  pid?: string;
}

export const usePathQueryStore = defineStore('app-path-query', () => {
  const query: Ref<querState> = ref({});
  function initQuery() {
    const params = location.pathname.replace('/src/projects', '').split('/');
    query.value.aid = params[2];
    query.value.pid = params[3];
  }

  function getAid() {
    return query.value.aid;
  }

  function getPid() {
    return query.value.pid;
  }

  return { query, initQuery, getAid, getPid };
});

export function usePahtQueryStoreWithOut() {
  return usePathQueryStore(store);
}
