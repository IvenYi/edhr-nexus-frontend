import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';

const ONLINE_FORM_DEV_ENTRY_PATH = 'src/projects/online-form';

function getOnlineFormRouterBase() {
  const pathname = window.location.pathname;
  if (import.meta.env.DEV && pathname.includes(ONLINE_FORM_DEV_ENTRY_PATH)) {
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }
  return import.meta.env.BASE_URL || import.meta.env.VITE_PUBLIC_PATH;
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/designer',
  },
  {
    path: '/designer',
    name: 'OnlineFormDesigner',
    component: () => import('/@online-form/views/integration/apaas_dp/designer/apaas-dp-print.vue'),
    meta: {
      orderNo: 1,
      title: 'sys.menu.appCenter',
      icon: 'iconfont:icon-yingyongzhongxin1',
    },
  },
  {
    path: '/:path(.*)*',
    redirect: '/designer',
  },
];

export function setupRouter(app: App<Element>) {
  const router = createRouter({
    history: createWebHashHistory(getOnlineFormRouterBase()),
    routes,
    strict: true,
    scrollBehavior: () => ({ left: 0, top: 0 }),
  });

  app.use(router);
  return router;
}
