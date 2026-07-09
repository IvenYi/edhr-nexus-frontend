import { ref, watch } from 'vue';
import { getAppPageGetListReleasedApp } from '/@/apis/gct-platform/AppController';
import type { AppResponse } from '/@/apis/gct-platform/model';

const drawerVisible = ref<boolean>(false);
const userApps = ref<AppResponse[]>([]);
const userAppsLoading = ref<boolean>(false);

watch(
  drawerVisible,
  async (val) => {
    if (val && userApps.value.length === 0) {
      userAppsLoading.value = true;
      const res = await getAppPageGetListReleasedApp().finally(() => {
        userAppsLoading.value = false;
      });
      userApps.value = res ?? [];
    }
  },
  {
    immediate: true,
  },
);

export function useToggleDrawer() {
  function toggleDrawer() {
    drawerVisible.value = !drawerVisible.value;
  }

  return {
    drawerVisible,
    toggleDrawer,
    userApps,
    userAppsLoading,
  };
}
