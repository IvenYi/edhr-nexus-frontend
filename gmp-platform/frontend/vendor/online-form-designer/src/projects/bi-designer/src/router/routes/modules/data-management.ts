import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/bi-platform-menu-layout.vue';

const dashboard: AppRouteModule = {
  path: '/bi-data-management',
  name: 'BiDataManagement',
  component: LAYOUT,
  redirect: '/bi-data-management/data-resource',
  meta: {
    orderNo: 1,
    type: 'bi',
    title: 'sys.menu.dataManagement',
    icon: 'iconfont:icon-shujumoxing',
  },
  children: [
    {
      path: 'data-resource',
      name: 'DataResource',
      component: () => import('/@bi-designer/views/data-source/index.vue'),
      meta: {
        title: 'sys.pageDesigner.dataResource',
      },
    },
    {
      path: 'data-set',
      name: 'DataSet',
      component: () => import('/@bi-designer/views/data-set/index.vue'),
      meta: {
        title: 'sys.menu.dataSet',
      },
    },
  ],
};

export default dashboard;
