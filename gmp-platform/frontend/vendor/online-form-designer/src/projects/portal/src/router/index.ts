import type { RouteRecordRaw } from 'vue-router';
import type { App } from 'vue';
import { useAppStoreWithOut } from '/@/store/modules/app';
import { createRouter, createWebHashHistory } from 'vue-router';
import { basicRoutes } from './routes';
import { useRouterStore } from '/@/store/modules/router';
import { useUserStore, useUserStoreWithOut } from '/@/store/modules/user';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import { Modal } from 'ant-design-vue';

const userStore = useUserStore();

const { notification } = useMessage();

const userInfo = useUserStoreWithOut();

const { t } = useI18n();

const appStore = useAppStoreWithOut();

// 白名单应该包含基本静态路由
// const WHITE_NAME_LIST: string[] = [];
// const getRouteNames = (array: any[]) =>
//   array.forEach((item) => {
//     WHITE_NAME_LIST.push(item.name);
//     getRouteNames(item.children || []);
//   });
// getRouteNames(basicRoutes);

// app router
// 创建一个可以被 Vue 应用程序使用的路由实例

// reset router
// export function resetRouter() {
//   router.getRoutes().forEach((route) => {
//     const { name } = route;
//     if (name && !WHITE_NAME_LIST.includes(name as string)) {
//       router.hasRoute(name) && router.removeRoute(name);
//     }
//   });
// }
// config router
// 配置路由器
export function setupRouter(app: App<Element>) {
  const routerStore = useRouterStore();
  const router = createRouter({
    // 创建一个 hash 历史记录。
    history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
    // 应该添加到路由的初始路由列表。
    routes: basicRoutes as unknown as RouteRecordRaw[],
    // 是否应该禁止尾部斜杠。默认为假
    strict: true,
    scrollBehavior: () => ({ left: 0, top: 0 }),
  });
  app.use(router);
  routerStore.setRouter(router);
  return router;
}
