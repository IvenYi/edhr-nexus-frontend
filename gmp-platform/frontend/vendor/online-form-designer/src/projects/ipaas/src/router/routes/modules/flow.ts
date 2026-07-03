import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule = {
  path: '/flow',
  name: 'IPaaSFlow',
  component: () => import('/@ipaas/views/flow.vue'),
  meta: {
    orderNo: 1,
    title: 'flow',
    icon: 'iconfont:icon-yingyongzhongxin1',
  },
};

export default module;
