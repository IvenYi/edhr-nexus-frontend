import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule = {
  path: '/label-designer/:id',
  name: 'LabelDesignerDetail',
  component: () => import('/@app-designer/views/print-designer-new/label-design/designer.vue'),
  meta: {
    orderNo: 2,
    title: 'sys.printDesigner.labelDesigner',
    icon: 'ant-design:appstore-outlined',
    hideTab: true,
    hideMenu: true,
  },
};

export default module;
