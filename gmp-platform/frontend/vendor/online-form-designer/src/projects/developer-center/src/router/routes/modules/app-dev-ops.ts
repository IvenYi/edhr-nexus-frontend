import type { AppRouteModule } from '/@/router/types';
import PlatformMenuLayout from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/app-dev-ops',
  name: 'AppDevOps',
  component: PlatformMenuLayout,
  redirect: '/app-dev-ops/data-base-ops',
  meta: {
    orderNo: 6,
    title: 'sys.menu.appDevelopOps',
    icon: 'iconfont:icon-yingyongyunwei1',
  },
  children: [
    {
      path: 'db-ops',
      name: 'DataBaseDevOps',
      component: () => import('/@developer-center/views/app-dev-ops/db-ops/index.vue'),
      meta: {
        title: 'sys.menu.dataBaseOps',
        standbyHomePage: true,
      },
    },
    {
      path: 'migration',
      name: 'DataMigration',
      component: () => import('/@developer-center/views/app-dev-ops/data-migration/index.vue'),
      meta: {
        title: 'sys.menu.dataMigration',
        standbyHomePage: true,
      },
    },
  ],
};

export default module;
