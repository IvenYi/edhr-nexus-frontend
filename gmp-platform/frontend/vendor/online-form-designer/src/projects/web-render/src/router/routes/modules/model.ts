import type { AppRouteModule } from '/@/router/types';
// import { LAYOUT } from '/@/router/constant';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

const dashboard: AppRouteModule = {
  path: '/dashboard',
  name: 'Dashboard',
  component: LAYOUT,
  redirect: '/dashboard/workbenchkbench',
  meta: {
    orderNo: 1,
    title: 'sys.dashboard',
    icon: 'ant-design:appstore-outlined',
  },
  children: [
    {
      path: 'workbenchkbench',
      name: 'Workbenchkbench',
      component: () => import('/@web-render/views/dashboard/workbenchkbench/index.vue'),
      meta: {
        title: 'sys.workbench',
      },
    },
    {
      path: 'statisticalReport',
      name: 'StatisticalReport',
      component: () => import('/@web-render/views/dashboard/statisticalReport/index.vue'),
      meta: {
        title: 'sys.statisticalReport',
      },
    },
  ],
};
export default dashboard;
