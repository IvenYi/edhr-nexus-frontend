import { computed, reactive } from 'vue';
import { PlatformSettingEnum, GlobalSetting } from './types';
import {
  getBasicConfigDetail,
  postBasicConfigGlobal,
} from '/@/apis/gct-apaas/BasicConfigController';
import type { SysConfigResponse } from '/@/apis/gct-platform/model';
import { nullDisplayEnum } from '@gct/runtime';
import { getDashboardList } from '/@/apis/gct-apaas/DashboardController';

const globalSetting: GlobalSetting = reactive({
  emptyDisplay: '--',
});

export function useGlobalSetting() {
  const postGlobalSetting = async () => {
    const value = JSON.stringify(globalSetting);

    await postBasicConfigGlobal({ value, id: 'sys.global.cfg' });
  };

  async function loadGlobalSetting() {
    let res: any = null;
    res = await getBasicConfigDetail({ configEnum: PlatformSettingEnum.GLOBAL });

    res && setGlobalSetting(res);
  }

  function setGlobalSetting(data: SysConfigResponse) {
    const { value } = data;
    if (!value) return;
    try {
      Object.assign(gct.appSetting, globalSetting, JSON.parse(value));
      Object.assign(globalSetting, JSON.parse(value));
    } catch (err) {
      console.warn(err);
    }
  }

  const displayValue = computed(() => {
    return nullDisplayEnum[globalSetting.emptyDisplay] as string;
  });

  return {
    globalSetting,
    loadGlobalSetting,
    setGlobalSetting,
    postGlobalSetting,
    displayValue,
  };
}

/**在线获取仪表盘路由 */
export async function getDashboardRouters() {
  const dashboardRoute = (await getDashboardList({})) || [];
  return dashboardRoute
    .filter((p) => p.status)
    .map((i) => {
      return {
        path: '/dashboard/' + i.id,
        name: 'Dashboard',
        meta: {
          hideBreadcrumb: false,
          title: i.name,
        },
      };
    });
}
