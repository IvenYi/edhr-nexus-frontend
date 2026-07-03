import type { Router, RouteRecordRaw } from 'vue-router';

import { usePermissionStoreWithOut } from '/@/store/modules/permission';

import { PageEnum } from '/@/enums/pageEnum';
import { useUserStoreWithOut } from '/@/store/modules/user';

import { PAGE_NOT_FOUND_ROUTE, PAGE_NOT_FOUND_ROUTE_IN_PLATFORM } from '/@/router/routes/basic';

import { RootRoute } from '/@/router/routes';

import { useEnv } from '/@/hooks/develop/useEnv';

const { isAppSingle, isSandbox } = useEnv();

const LOGIN_PATH = PageEnum.BASE_LOGIN;

const ROOT_PATH = RootRoute.path;

const whitePathList: PageEnum[] = [LOGIN_PATH, PageEnum.NOT_FOUND];

const getSignWay = () => {
  // 先尝试从标准查询参数中获取
  let signWay = new URLSearchParams(window.location.search).get('signWay');
  if (signWay) return signWay;

  // 如果没找到，再从 hash 中解析
  const hash = window.location.hash;
  const queryIndex = hash.indexOf('?');
  if (queryIndex !== -1) {
    const hashParams = new URLSearchParams(hash.slice(queryIndex + 1));
    signWay = hashParams.get('signWay');
  }
  return signWay;
};

export function createPermissionGuard(router: Router) {
  console.log('auth develop', 'createPermissionGuard');
  const userStore = useUserStoreWithOut();
  const permissionStore = usePermissionStoreWithOut();

  const pageNotFoundRoute = permissionStore.isInPlatform
    ? PAGE_NOT_FOUND_ROUTE_IN_PLATFORM
    : PAGE_NOT_FOUND_ROUTE;

  router.beforeEach(async (to, from, next) => {
    console.log('to', to, from, next, isSandbox);

    if (to.query.hosted === '1') {
      next();
      return;
    }

    if (to.meta.singleSign && to.query.token) {
      /**单点登录中转逻辑 */
      userStore.setToken((to.query.token as string) || '');
      const signWay = getSignWay();
      console.log('hash', signWay);
      sessionStorage.setItem('signWay', signWay);
      userStore.afterLoginAction(true);
      next(false);
      return;
    }
    if (
      from.path === ROOT_PATH &&
      to.path === PageEnum.BASE_HOME &&
      permissionStore.getCurrentHomePath &&
      permissionStore.getCurrentHomePath !== PageEnum.BASE_HOME
    ) {
      next(permissionStore.getCurrentHomePath);
      return;
    }

    // 如果是单应用登录或沙箱环境，不管是否有token直接进入登录页
    if (
      (isAppSingle || isSandbox) &&
      (to.path === PageEnum.BASE_LOGIN || to.path === PageEnum.NOT_FOUND)
    ) {
      console.log(33333333);

      next();
      return;
    }

    const token = userStore.getToken;

    // Whitelist can be directly entered
    if (whitePathList.includes(to.path as PageEnum)) {
      if (to.path === LOGIN_PATH && token) {
        const isSessionTimeout = userStore.getSessionTimeout;
        try {
          await userStore.afterLoginAction();
          if (!isSessionTimeout) {
            next((to.query?.redirect as string) || '/');
            return;
          }
        } catch {
          //
        }
      }
      next();
      return;
    }

    // ! 从选择租户页面跳转到首页，如果没有选择租户或者租户列表没有选择的租户则不能跳转
    if (
      token &&
      from.path === PageEnum.BASE_TENANT &&
      to.path === PageEnum.BASE_HOME &&
      userStore.getUserInfo!.tenantList.length !== 0 &&
      !userStore.getTenant &&
      !userStore.getUserInfo!.tenantList.some((item) => item.id === userStore.getTenant)
    ) {
      next(false);
      return;
    }

    // token or user does not exist

    if (!token) {
      // You can access without permission. You need to set the routing meta.ignoreAuth to true
      if (to.meta.ignoreAuth) {
        next();
        return;
      }
      if (
        !userStore.getTenant &&
        ![PageEnum.BASE_HOME, LOGIN_PATH, ROOT_PATH].includes(to.path) &&
        !(isAppSingle || isSandbox)
      ) {
        //没有租户信息会导致下次登录的时候跳过选择租户的页面 所以直接返回门户的登录页面比较稳妥
        location.href = location.origin;
        return;
      }
      // redirect login page
      const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
        path: LOGIN_PATH,
        replace: true,
      };

      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      next(redirectData);
      return;
    }

    // Jump to the 404 page after processing the login
    if (
      from.path === LOGIN_PATH &&
      to.name === pageNotFoundRoute.name &&
      to.fullPath !== (permissionStore.getCurrentHomePath || PageEnum.BASE_HOME)
    ) {
      next(permissionStore.getCurrentHomePath || PageEnum.BASE_HOME);
      return;
    }

    // get userinfo while last fetch time is empty
    if (userStore.getLastUpdateTime === 0) {
      try {
        await userStore.getUserInfoAction();
      } catch (err) {
        next();
        return;
      }
    }

    if (permissionStore.getIsDynamicAddedRoute || to.meta.preview) {
      next();
      return;
    }

    const routes = await permissionStore.buildRoutesAction();

    routes.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw);
    });

    router.addRoute(pageNotFoundRoute as unknown as RouteRecordRaw);

    permissionStore.setDynamicAddedRoute(true);

    // 如果设备互联没有权限跳转到开发者中心默认首页
    if (!permissionStore.IOTPermission && to.fullPath.includes('device-interconnection')) {
      next(PageEnum.BASE_HOME);
    }

    if (to.name === pageNotFoundRoute.name) {
      // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
      next({ path: to.fullPath, replace: true, query: to.query });
    } else {
      const redirectPath = (from.query.redirect || to.path) as string;
      const redirect = decodeURIComponent(redirectPath);
      const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect };
      next(nextData);
    }
  });
}
