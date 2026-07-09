import { createRouter, createWebHashHistory } from 'vue-router';
import { AccessToken } from '@mobile/stores/loginHooks';
import { uuid2 } from '@/utils/uuid';
import { usePageCaches } from '@mobile/utils/cachePage';

const LAYOUT = () => import('@mobile/layouts/index.vue');
const APP_LAYOUT = () => import('@mobile/layouts/applayout.vue');
const { has, clearPageKey } = usePageCaches();
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@mobile/views/index.vue'),
    },
    {
      path: '/login',
      name: 'login',
      meta: {},
      component: () => import('@mobile/views/login/index.vue'),
    },
    {
      path: '/tenant',
      name: 'tenant',
      meta: {},
      component: () => import('@mobile/views/login/tenant.vue'),
    },
    {
      path: '/edit-password',
      name: 'edit-password',
      meta: {},
      component: () => import('@mobile/views/login/edit-password.vue'),
    },
    {
      path: '/notFound',
      name: 'notFound',
      meta: {},
      component: () => import('@mobile/views/error-log/not-found.vue'),
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('@mobile/views/main/index.vue'),
      children: [
        {
          path: 'workbench',
          name: 'workbench',
          meta: {},
          component: () => import('@mobile/views/main/workbench/index.vue'),
        },
        {
          path: 'user',
          name: 'user',
          meta: {},
          component: () => import('@mobile/views/main/user/index.vue'),
        },
        {
          path: 'message',
          name: 'message',
          meta: {},
          component: () => import('@mobile/views/main/message/index.vue'),
        },
        {
          path: 'todo',
          name: 'todo',
          meta: {},
          component: () => import('@mobile/views/main/todo/index.vue'),
        },
        {
          path: 'menuCenter',
          name: 'appMenu',
          meta: {},
          component: () => import('@mobile/views/main/appMenu/index.vue'),
        },
        // {
        //   path: 'custom/:id',
        //   name: 'custom',
        //   meta: {},
        //   component: () => import('@mobile/views/main/custom/index.vue'),
        // },
      ],
    },
    {
      path: '/other',
      component: LAYOUT,
      children: [
        {
          path: 'info',
          name: 'info',
          meta: {
            title: '个人信息',
          },
          component: () => import('@mobile/views/main/user/info.vue'),
        },
        {
          path: 'password',
          name: 'password',
          meta: {
            title: '修改密码',
          },
          component: () => import('@mobile/views/main/user/password.vue'),
        },
        {
          path: 'fullname',
          name: 'fullname',
          meta: {
            title: '修改姓名',
          },
          component: () => import('@mobile/views/main/user/fullname.vue'),
        },
        {
          path: 'mobile',
          name: 'mobile',
          meta: {
            title: '修改手机号',
          },
          component: () => import('@mobile/views/main/user/mobile.vue'),
        },
        {
          path: 'email',
          name: 'email',
          meta: {
            title: '修改邮箱',
          },
          component: () => import('@mobile/views/main/user/email.vue'),
        },
      ],
    },
    {
      path: '/myApp',
      component: LAYOUT,
      children: [
        {
          path: 'menucenter',
          name: 'menucenter',
          meta: {},
          component: () => import('@mobile/views/myApp/index.vue'),
        },
      ],
    },
    {
      path: '/appPage',
      name: 'appPage',
      component: APP_LAYOUT,
      children: [],
    },
    {
      path: '/quickMenu',
      name: 'quickMenu',
      meta: {},
      component: () => import('@mobile/views/quickMenu/index.vue'),
    },
    {
      path: '/process/:linkPage',
      name: 'process',
      component: () => import('@mobile/render/process.vue'),
    },
    {
      path: '/PagePreview/:linkPage',
      name: 'PagePreview',
      meta: {
        preview: true,
      },
      component: () => import('@mobile/render/preview.vue'),
    },
    {
      path: '/historyPreview/:linkPage',
      name: 'historyPreview',
      meta: {
        preview: true,
      },
      component: () => import('@mobile/render/preview.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
const AppPath = '/appPage/';
router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith(AppPath)) {
    const tohash = to.query.hash + '';
    const fromhash = from.query.hash + '';
    if (!router.hasRoute(tohash)) {
      router.addRoute('appPage', generateRoute(tohash));
      next(to);
      return;
    } else if (has(fromhash) && has(tohash)) {
      clearPageKey(fromhash);
      router.removeRoute(fromhash);
    }
  }
  if (from.name === 'login' && !AccessToken.value) {
    next(false);
    return;
  }
  next();
});
/**实时生成路由 */
function generateRoute(hash: string) {
  return {
    path: `${hash}/:linkPage`,
    name: hash,
    meta: { closeIcon: true },
    component: () =>
      import('@mobile/render/index.vue').then((res) => ({
        ...res.default,
        name: hash,
      })),
  };
}
/**二次封装动态页面内部路由跳转 */
export const routerPush = (linkPage: string, query = {}) => {
  const hash = uuid2(4);
  router.push({
    path: `/appPage/${hash}/${linkPage}`,
    query: { ...query, hash },
  });
};
/**二次封装动态页面内部路由跳转 */
export const routerReplace = (linkPage: string, query = {}) => {
  const hash = uuid2(4);
  router.replace({
    path: `/appPage/${hash}/${linkPage}`,
    query: { ...query, hash },
  });
};

(window as any).___router = router;

export default router;
