import type { AppRouteModule } from '/@/router/types';
import { ProcessCenterSubMenus } from '../constants';

const routes: AppRouteModule[] = [
  {
    path: '/process',
    name: 'ProcessCenter',
    component: () => import('/@portal/views/process/index.vue'),
    meta: {
      title: 'sys.menu.processCenter',
    },
    redirect: '/process/todo',
    children: ProcessCenterSubMenus,
  },
];

export default routes;
