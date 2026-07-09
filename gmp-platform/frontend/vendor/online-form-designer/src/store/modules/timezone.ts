import { TIMEZONE_KEY } from '/@/enums/cacheEnum';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { createLocalStorage } from '/@/utils/cache';

const ls = createLocalStorage();

const timezone = ls.get(TIMEZONE_KEY) || 'UTC+08:00';

interface Timezone {
  timezone: string;
}

export const useTimezoneStore = defineStore({
  id: 'app-timezone',
  state: (): Timezone => ({
    timezone: timezone,
  }),
  getters: {
    getTimezone(state): string {
      return state.timezone;
    },
  },
  actions: {
    setTimezone(timezone: string) {
      this.timezone = timezone;
      ls.set(TIMEZONE_KEY, this.timezone);
    },
  },
});

// Need to be used outside the setup
export function useTimezoneStoreWithOut() {
  return useTimezoneStore(store);
}
