import type { AppRouteModule } from '/@/router/types';
// import { LAYOUT } from '/@/router/constant';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

const settings: AppRouteModule = {
  path: '/settings',
  name: 'Settings',
  component: LAYOUT,
  redirect: '/settings/role',
  meta: {
    title: 'sys.menu.appSetting',
    icon: 'iconfont:icon-menhuguanli',
  },
  children: [
    {
      path: 'role',
      name: 'Role',
      component: () => import('/@web-render/views/role/role.vue'),
      meta: {
        title: 'sys.menu.roleManagement',
        hideChildrenInMenu: true,
      },
      children: [
        {
          path: 'permission-setting/:roleId',
          name: 'PermissionSetting',
          component: () => import('/@web-render/views/role/role.vue'),
          meta: {
            title: 'sys.menu.rolePermissionSetting',
            currentActiveMenu: '/settings/role',
          },
        },
      ],
    },
  ],
};
export default settings;
