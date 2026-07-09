import type { AppRouteRecordRaw } from '/@/router/types';
import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '/@/router/routes/basic';
import { PageEnum } from '/@/enums/pageEnum';

// 根路由
export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('/@/views/sys/login/login.vue'),
  meta: {
    title: 'sys.login',
  },
};

export const TenantRoute: AppRouteRecordRaw = {
  path: '/tenant',
  name: 'Tenant',
  component: () => import('/@/views/sys/login/tenant.vue'),
  meta: {
    title: 'sys.chooseTenant',
  },
};

export const SingleSignRoute: AppRouteRecordRaw = {
  path: '/single-sign-on',
  name: 'singleSignOn',
  component: () => import('/@/views/sys/login/single-sign-on.vue'),
  meta: {
    singleSign: true,
    title: '',
  },
};

export const BI404Route: AppRouteRecordRaw = {
  path: '/bi-404',
  name: 'BIPageNotFound',
  component: () => import('/@bi-designer/views/error/index.vue'),
  meta: {
    title: 'ErrorPage',
  },
};

// Basic routing without permission
// 未经许可的基本路由
export const basicRoutes = [
  LoginRoute,
  RootRoute,
  REDIRECT_ROUTE,
  PAGE_NOT_FOUND_ROUTE,
  TenantRoute,
  SingleSignRoute,
  BI404Route,
];
