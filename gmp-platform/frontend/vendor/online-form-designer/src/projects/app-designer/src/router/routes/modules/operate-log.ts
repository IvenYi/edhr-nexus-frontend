import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';
import { BasicAction } from '/@/enums/authActionEnum';

const module: AppRouteModule = {
  path: '/operation-log',
  name: 'OperationLog',
  component: LAYOUT,
  redirect: '/operation-log/login-log',
  meta: {
    orderNo: 6,
    title: 'sys.menu.auditLog',
    icon: 'iconfont:icon-caozuorizhi',
    skipAuthAccess: true,
  },
  children: [
    {
      path: 'login-log',
      name: 'LoginLog',
      component: () => import('/@app-designer/views/login-log/index.vue'),
      meta: {
        title: 'sys.menu.loginLog',
        standbyHomePage: true,
      },
    },
    {
      path: 'audit-log',
      name: 'AuditLog',
      component: () => import('/@app-designer/views/audit-log/index.vue'),
      meta: {
        title: 'sys.menu.operationLog',
        standbyHomePage: true,
      },
    },

  ],
};

export default module;
