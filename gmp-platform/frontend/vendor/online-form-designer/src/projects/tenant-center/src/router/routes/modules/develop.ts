import type { AppRouteModule } from '/@/router/types';
// import { PAAS_LAYOUT as LAYOUT } from '/@/router/constant';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

import { CustomAction, DefaultActions } from '/@/enums/authActionEnum';

const dashboard: AppRouteModule = {
  path: '/develop',
  name: 'Develop',
  component: LAYOUT,
  redirect: '/develop/developer',
  meta: {
    orderNo: 3,
    title: 'sys.menu.developManagement',
    icon: 'iconfont:icon-kaifaguanli',
    skipAuthAccess: true,
  },
  children: [
    {
      path: 'developer',
      name: 'DevelopDeveloper',
      component: () => import('/@tenant-center/views/develop/developer/developer-list.vue'),
      meta: {
        title: 'sys.menu.developer',
        authActions: [...DefaultActions, CustomAction.RemoveAndHandover],
        standbyHomePage: true,
      },
    },
    {
      path: 'app',
      name: 'DevelopAppManagement',
      component: () => import('/@tenant-center/views/develop/app-manage/index.vue'),
      meta: {
        title: 'sys.menu.appManagement',
        standbyHomePage: true,
      },
    },
  ],
};

export default dashboard;
