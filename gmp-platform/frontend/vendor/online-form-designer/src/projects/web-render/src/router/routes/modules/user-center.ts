import type { AppRouteModule } from '/@/router/types';
import { UserCenterSubMenus } from '/@portal/router/routes/constants';
import PlatformMenuLayout from '/@/layouts/platform/platform-menu-layout.vue';

const routes: AppRouteModule[] = [
  {
    path: '/user-center',
    name: 'UserCenter',
    component: PlatformMenuLayout,
    meta: {
      title: 'sys.menu.personalSetting',
      hideMenu: true,
    },
    redirect: '/user-center/my',
    children: [
      ...UserCenterSubMenus.map((m) => {
        return {
          ...m,

          component: () => import('/@portal/views/user-center/modules/index.vue'),
        };
      }),
      {
        path: '/dashboard/:id',
        name: 'Dashboard',
        component: () => import('/@portal/views/main-page/main-page-web.vue'),
        meta: {
          icon: 'ant-design:appstore-outlined',
          title: '',
        },
      },
    ],
  },
];

export default routes;
