import type { RouteRecordRaw } from 'vue-router';
import type { App } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { basicRoutes } from './routes';
import { useRouterStore } from '/@/store/modules/router';

// app router
// 创建一个可以被 Vue 应用程序使用的路由实例
// config router
// 配置路由器
export const router = createRouter({
  // 创建一个 hash 历史记录。
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
  // 应该添加到路由的初始路由列表。
  routes: basicRoutes as unknown as RouteRecordRaw[],
  // 是否应该禁止尾部斜杠。默认为假
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});
export function setupRouter(app: App<Element>) {
  const routerStore = useRouterStore();

  app.use(router);
  routerStore.setRouter(router);
  router.beforeEach((to) => {
    if (to.name === 'designById') {
      to.meta.currentActiveMenu = <string>to.query.currentActiveMenu;
    }
  });
  window.$router = router;
  return router;
}
