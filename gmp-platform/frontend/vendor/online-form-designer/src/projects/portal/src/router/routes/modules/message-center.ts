import type { AppRouteModule } from '/@/router/types';
import { MessageCenterSubMenus } from '../constants';

const mainPageRoutes: AppRouteModule[] = [
  {
    path: '/message',
    name: 'MessageCenter',
    component: () => import('/@portal/views/message/index.vue'),
    meta: {
      title: 'sys.menu.messageCenter',
    },
    redirect: '/message/unread',
    children: MessageCenterSubMenus,
  },
];

export default mainPageRoutes;
