import type { AppRouteModule } from '/@/router/types';
// import { PAAS_LAYOUT } from '/@/router/constant';
import PlatformMenuLayout from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/app-center',
  name: 'AppCenter',
  component: PlatformMenuLayout,
  redirect: '/app-center/index',
  meta: {
    orderNo: 1,
    title: 'sys.menu.appMangement',
    // title: 'sys.menu.appCenter',
    icon: 'iconfont:icon-yingyongzhongxin1',
  },
  children: [
    {
      path: 'index',
      name: 'AppCenterIndex',
      component: () => import('/@developer-center/views/app-center/index.vue'),
      meta: {
        title: 'sys.menu.appConfig',
        // title: 'sys.menu.appCenter',
        // hideMenu: true,
        // currentActiveMenu: '/app-center',
        standbyHomePage: true,
      },
    },
    {
      path: 'mobile-desinger',
      name: 'AppCenterMobileDesinger',
      component: () => import('/@developer-center/views/app-center/mobile-desinger.vue'),
      meta: {
        // hideMenu: true,
        title: 'sys.menu.mobileDesinger',
        standbyHomePage: true,
      },
    },
  ],
};

export default module;
