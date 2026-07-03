import type { AppRouteModule } from '/@/router/types';

const mainPageRoutes: AppRouteModule[] = [
  {
    path: '/home',
    name: 'MainPage',
    component: () => import('/@portal/views/main-page/main-page.vue'),
    meta: {
      title: 'sys.portalHome',
      hideMenu: true,
      hideBreadcrumb: true,
    },
  },
];

export default mainPageRoutes;
