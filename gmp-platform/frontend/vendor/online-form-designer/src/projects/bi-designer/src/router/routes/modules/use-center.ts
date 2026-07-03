import type { AppRouteModule } from '/@/router/types';
import { UserCenterSubMenus } from '/@portal/router/routes/constants';

const routes: AppRouteModule[] = [
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('/@bi-designer/views/user-center/index.vue'),
    meta: {
      title: 'sys.menu.personalSetting',
      hideMenu: true,
      hideBreadcrumb: true,
    },
    redirect: '/user-center/my',
    children: UserCenterSubMenus,
  },
];

export default routes;
