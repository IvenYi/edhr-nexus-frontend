import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

const dashboard: AppRouteModule = {
  path: '/app-design',
  name: 'AppDesign',
  component: LAYOUT,
  redirect: '/app-design/model-designer',
  meta: {
    orderNo: 1,
    title: 'sys.menu.appDesign',
    icon: 'iconfont:icon-yingyongsheji',
  },
  children: [
    {
      path: 'model-designer',
      name: 'ModelDesigner',
      component: () => import('/@app-designer/views/model-desginer/model-designer.vue'),
      meta: {
        title: 'sys.menu.modelDesign',
      },
    },
    {
      path: 'page-designer',
      name: 'PageDesigner',
      component: () => import('/@app-designer/views/page-designer/page-designer.vue'),
      meta: {
        title: 'sys.menu.pageDesign',
        ignoreCacheQuery: 1
      },
    },
    // {
    //   path: 'print-designer',
    //   name: 'PrintDesigner',
    //   component: () => import('/@app-designer/views/print-designer/print-designer.vue'),
    //   meta: {
    //     title: 'sys.menu.printDesign',
    //   },
    // },
    {
      path: 'print-designer-new',
      name: 'PrintDesign',
      component: () => import('/@app-designer/views/print-designer-new/print-designer.vue'),
      meta: {
        title: 'sys.menu.labelDesign',
      },
    },
    // {
    //   path: 'process',
    //   name: 'Process',
    //   component: () => import('/@app-designer/views/process/process-design.vue'),
    //   meta: {
    //     title: 'sys.menu.processDesign',
    //   },
    // },
    {
      path: 'process-new',
      name: 'Process',
      component: () => import('/@app-designer/views/process-new/process-designer.vue'),
      meta: {
        title: 'sys.menu.processDesign',
      },
    },
    {
      path: 'information-card',
      name: 'InformationCard',
      component: () => import('/@app-designer/views/information-card/index.vue'),
      meta: {
        title: 'sys.menu.informationCard',
      },
    },
  ],
};

export default dashboard;
