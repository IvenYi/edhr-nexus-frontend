import type { AppRouteModule } from '/@/router/types';
// import { PAAS_LAYOUT } from '/@/router/constant';
import PlatformMenuLayout from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/env',
  name: 'Env',
  component: PlatformMenuLayout,
  redirect: '/env/test',
  meta: {
    orderNo: 4,
    title: 'sys.menu.envManagement',
    icon: 'iconfont:icon-huanjingguanli',
  },
  children: [
    {
      path: 'test',
      name: 'EnvTest',
      component: () => import('/@developer-center/views/env/test/test-app-index.vue'),
      meta: {
        title: 'sys.menu.envTestManagement',
      },
    },
    {
      path: 'test/:id/:appid',
      name: 'EnvTestAppDetail',
      component: () => import('/@developer-center/views/env/test/test-app-detail.vue'),
      meta: {
        title: 'sys.menu.envTestManagement',
        currentActiveMenu: '/env/test',
        hideMenu: true,
      },
    },
    {
      path: 'prod',
      name: 'EnvProd',
      component: () => import('/@developer-center/views/env/prod/prod-app-index.vue'),
      meta: {
        title: 'sys.menu.envProdManagement',
      },
    },
    {
      path: 'prod/:id/:appid',
      name: 'EnvProdAppDetail',
      component: () => import('/@developer-center/views/env/prod/prod-app-detail.vue'),
      meta: {
        title: 'sys.menu.envProdManagement',
        currentActiveMenu: '/env/prod',
        hideMenu: true,
      },
    },
  ],
};

export default module;
