import type { AppRouteModule } from '/@/router/types';
// import { PAAS_LAYOUT as LAYOUT } from '/@/router/constant';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';
import { BasicAction } from '/@/enums/authActionEnum';

const dashboard: AppRouteModule = {
  path: '/tenant',
  name: 'Tenant',
  component: LAYOUT,
  redirect: '/tenant/list',
  meta: {
    orderNo: 2,
    title: 'sys.menu.tenantManagement',
    icon: 'iconfont:icon-zuhuguanli',
    skipAuthAccess: true,
  },
  children: [
    {
      path: 'list',
      name: 'TenantList',
      component: () => import('/@/projects/backend-management/src/views/tenant/tenant.vue'),
      meta: {
        title: 'sys.menu.tenantList',
        authActions: [BasicAction.Update],
      },
    },
  ],
};

export default dashboard;
