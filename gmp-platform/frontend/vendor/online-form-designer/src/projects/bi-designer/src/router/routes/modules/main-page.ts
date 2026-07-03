import type { AppRouteModule } from '/@/router/types';

const mainPageRoutes: AppRouteModule[] = [
  {
    path: '/home',
    name: 'MainPage',
    component: () => import('/@bi-designer/views/main-page/bi-main-page.vue'),
    meta: {
      title: 'BI',
      hideMenu: true,
      hideBreadcrumb: true,
    },
  },
];

export default mainPageRoutes;
