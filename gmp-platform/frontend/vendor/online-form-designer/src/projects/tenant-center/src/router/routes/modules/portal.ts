import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

import { BasicAction, CustomAction, DefaultActions } from '/@/enums/authActionEnum';

const dashboard: AppRouteModule = {
  path: '/portal',
  name: 'Portal',
  component: LAYOUT,
  redirect: '/portal/app',
  meta: {
    orderNo: 2,
    title: 'sys.menu.portalManagement',
    icon: 'iconfont:icon-menhuguanli',
    skipAuthAccess: true,
  },
  children: [
    {
      path: 'app',
      name: 'PortalAppSetting',
      component: () => import('/@tenant-center/views/portal/app-setting/app-setting.vue'),
      meta: {
        title: 'sys.menu.appSetting',
        authActions: [BasicAction.Setting],
        standbyHomePage: true,
      },
    },
    // {
    //   path: 'app/:appid',
    //   name: 'PortalAppSettingDetail',
    //   component: () =>
    //     import('/@tenant-center/views/portal/app-setting/modules/app-setting-detail.vue'),
    //   meta: {
    //     title: 'sys.menu.appSettingDetail',
    //     currentActiveMenu: '/portal/app',
    //     hideMenuInAuth: true,
    //     standbyAuthName: `PortalAppSetting.${BasicAction.Setting}`,

    //     hideMenu: true,
    //   },
    // },
    // {
    //   path: 'card',
    //   name: 'PortalCardSetting',
    //   meta: {
    //     title: 'sys.menu.cardSetting',
    //     standbyHomePage: true,
    //   },
    // },
  ],
};

export default dashboard;
