import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule = {
  path: '/service-orchestration/:soid',
  name: 'ServiceOrchestration',
  component: () => import('/@app-designer/views/service-orchestration/index.vue'),
  meta: {
    orderNo: 2,
    title: 'sys.model.serviceOrchestration',
    icon: 'ant-design:appstore-outlined',
    hideTab: true,
    hideMenu: true,
  },
};

export default module;
