import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@start/pages/index.vue'),
    },
    {
      path: '/preview',
      component: () => import('@start/pages/preview.vue'),
    },
    {
      path: '/demo',
      component: () => import('@start/pages/demo.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  next();
});
export default router;
