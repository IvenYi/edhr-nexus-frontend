import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/bi-platform-menu-layout.vue';

const dashboard: AppRouteModule = {
  path: '/bi-data-analysis',
  name: 'BiDataAnalysis',
  component: LAYOUT,
  redirect: '/bi-data-analysis/data-resource',
  meta: {
    orderNo: 2,
    type: 'bi',
    title: 'sys.menu.dataAnalysis',
    icon: 'iconfont:icon-shujumoxing',
  },
  children: [
    // {
    //   path: 'dashboard',
    //   name: 'Dashboard',
    //   component: () => import('/@bi-designer/views/dashboard/index.vue'),
    //   meta: {
    //     title: 'sys.menu.dashboard',
    //   },
    // },
    {
      path: 'data-screen',
      name: 'dataScreen',
      component: () => import('/@bi-designer/views/data-screen/index.vue'),
      meta: {
        title: 'sys.menu.dataScreen',
      },
    },
  ],
};

export default dashboard;
