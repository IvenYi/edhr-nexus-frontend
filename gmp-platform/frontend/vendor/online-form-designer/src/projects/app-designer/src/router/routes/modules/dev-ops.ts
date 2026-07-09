import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/app-develop-ops',
  name: 'AppDevelopOps',
  component: LAYOUT,
  redirect: '/app-develop-ops/operation-log',
  meta: {
    orderNo: 5,
    title: 'sys.menu.appDevelopOps',
    icon: 'iconfont:icon-yingyongyunwei1',
  },
  children: [
    {
      path: 'data-ops',
      name: 'DataOps',
      component: () => import('/@app-designer/views/data-ops/index.vue'),
      meta: {
        title: 'sys.menu.dataOps',
      },
    },
    {
      path: 'sandbox',
      name: 'Sandbox',
      component: () => import('/@app-designer/views/sandbox/index.vue'),
      meta: {
        title: 'sys.menu.sandbox',
      },
    },
    // {
    //   path: 'operation-log',
    //   name: 'OperationLog1',
    //   component: () => import('/@app-designer/views/operation-log/operation-log.vue'),
    //   meta: {
    //     title: 'sys.menu.operationLog',
    //   },
    // },
  ],
};

export default module;
