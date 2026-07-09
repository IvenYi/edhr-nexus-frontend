import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule = {
  path: '/expression',
  name: 'Expression',
  component: () => import('/@app-designer/views/expression/index.vue'),
  meta: {
    orderNo: 2,
    title: 'sys.expression.index',
    icon: 'ant-design:appstore-outlined',
    hideTab: true,
    hideMenu: true,
  },
};

export default module;
