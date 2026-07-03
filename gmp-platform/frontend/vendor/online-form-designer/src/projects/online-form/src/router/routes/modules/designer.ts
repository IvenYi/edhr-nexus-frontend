import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule[] = [
  {
    path: '/designer',
    name: 'OnlineFormDesigner',
    component: () => import('../../../views/integration/apaas_dp/designer/apaas-dp-print.vue'),
    meta: {
      orderNo: 1,
      title: 'sys.menu.appCenter',
      icon: 'iconfont:icon-yingyongzhongxin1',
    },
  },
];

export default module;
