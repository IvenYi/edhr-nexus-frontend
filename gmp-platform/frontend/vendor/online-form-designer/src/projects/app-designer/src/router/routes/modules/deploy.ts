import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/app-deploy',
  name: 'AppDeployu',
  component: LAYOUT,
  redirect: '/app-publish/deployment',
  meta: {
    orderNo: 4,
    title: 'sys.menu.appDeploy',
    icon: 'iconfont:icon-yingyongfabu',
  },
  children: [
    {
      path: 'app-deployment',
      name: 'AppDeployment',
      component: () => import('/@app-designer/views/app-deployment/index.vue'),
      meta: {
        title: 'sys.menu.appDeployment',
      },
    },
  ],
};

export default module;
