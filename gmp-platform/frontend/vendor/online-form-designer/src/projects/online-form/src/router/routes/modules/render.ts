import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule[] = [
  {
    path: '/render',
    name: 'OnlineFormRender',
    component: () => import('../../../views/integration/apaas_dp/render/PaasOnlineForm.vue'),
    meta: {
      orderNo: 1,
      title: '',
      icon: 'iconfont:icon-yingyongzhongxin1',
    },
  },
];

export default module;
