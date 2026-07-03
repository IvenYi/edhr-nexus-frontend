import { Router } from 'vue-router';
import { defineStore } from 'pinia';
import { store } from '/@/store';

interface RouterStore{
  router:any
}

export const useRouterStore = defineStore({
  id: 'app-router',
  state: ():RouterStore => ({
    router: undefined,
  }),
  getters: {
    getRouter(state): Router {
      return state.router ;
    },
  },
  actions: {
    setRouter(router: Router) {
      this.router = router;
    },
  },
});

// Need to be used outside the setup
export function useRouterStoreWithOut() {
  return useRouterStore(store);
}
