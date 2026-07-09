import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule = {
  path: '/process-designer-new/:id',
  name: 'ProcessDesignerNew',
  component: () => import('/@app-designer/views/process-designer-new/index.vue'),
  meta: {
    orderNo: 2,
    title: 'sys.menu.processDesign',
    icon: 'ant-design:appstore-outlined',
    hideTab: true,
    hideMenu: true,
  },
};

export default module;
