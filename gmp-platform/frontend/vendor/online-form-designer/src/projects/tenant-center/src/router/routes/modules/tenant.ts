import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';
// import { CustomAction, DefaultActions } from '/@/enums/authActionEnum';

const dashboard: AppRouteModule = {
  path: '/tenant',
  name: 'Tenant',
  component: LAYOUT,
  redirect: '/tenant/basic',
  meta: {
    orderNo: 5,
    title: 'sys.menu.tenantManagement',
    icon: 'iconfont:icon-zuhuguanli',
    skipAuthAccess: true,
  },
  children: [
    {
      path: 'basic',
      name: 'BasicSetting',
      component: () => import('/@tenant-center/views/tenant/basic-setting/index.vue'),
      meta: {
        title: 'sys.menu.basicSetting',
        // authActions: [...DefaultActions, CustomAction.RemoveAndHandover],
        standbyHomePage: true,
      },
    },
  ],
};

export default dashboard;
