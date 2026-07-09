import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

const dashboard: AppRouteModule = {
  path: '/app-setting',
  name: 'AppSetting',
  component: LAYOUT,
  redirect: '/app-setting/basic-setting',
  meta: {
    orderNo: 3,
    title: 'sys.menu.appSetting',
    icon: 'iconfont:icon-yingyongshezhi',
  },
  children: [
    {
      path: 'menu-setting',
      name: 'MenuSetting',
      component: () => import('/@app-designer/views/app-setting/menu-setting.vue'),
      meta: {
        title: 'sys.menu.menuSetting',
      },
    },
    {
      path: 'personalization',
      name: 'Personalization',
      component: () => import('/@app-designer/views/app-setting/personalization.vue'),
      meta: {
        title: 'sys.menu.personalization',
      },
    },
    {
      path: 'custom-app-home-view',
      name: 'CustomAppHomeView',
      component: () =>
        import('/@app-designer/views/app-setting/custom-app-home-view/custom-app-home-view.tsx'),
      meta: {
        title: 'sys.menu.CustomAppIndex',
      },
      hidden: (appInfo): boolean => {
        return appInfo.mobileEnabled !== 1;
      },
    },
  ],
};

export default dashboard;
