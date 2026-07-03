import { useRouterStoreWithOut } from '/@/store/modules/router';
import { usePermissionStoreWithOut } from '/@/store/modules/permission';
import { basicRoutes } from '/@/router/routes';
import type { AppRouteRecordRaw } from '/@/router/types';
// import { getAsyncRouter } from '/@web-render/router/asyncRouter';
// import { ProjectName } from '/@/enums/appEnum';
import { getPlatTenantCfg } from '/@/apis/gct-platform/PlatformConfigController';
import { useUserStoreWithOut } from '/@/store/modules/user';

export function getCurrentRouter() {
  return useRouterStoreWithOut().getRouter;
}

export async function getProjectRoutesModules() {
  const { getCurrentProject } = usePermissionStoreWithOut();
  const reg = new RegExp(`/projects/${getCurrentProject}/`);

  const modules = import.meta.glob(`./../../projects/**/src/router/routes/modules/**/*.ts`, {
    import: 'default',
  });
  const userStore = useUserStoreWithOut();
  const res = await getPlatTenantCfg();
  const isDevelopEnabled = res?.developManagement === 1;

  const modules_routes: AppRouteRecordRaw[] = [];
  for (const path in modules) {
    if (reg.test(path)) {
      const module = (await modules[path]()) as AppRouteRecordRaw;
      const modList = Array.isArray(module) ? [...module] : [module];

      const isDevelop =
        path === '../../projects/tenant-center/src/router/routes/modules/develop.ts';

      if (!isDevelopEnabled && !userStore.getUserInfo?.globalSuperAdmin && isDevelop) {
        continue;
      }

      modules_routes.push(...modList);
    }
  }

  // switch (getCurrentProject) {
  //   case ProjectName.WEB_RENDER:
  //     await getAsyncRouter(modules_routes);
  //     break;
  //   default:
  //     break;
  // }
  return modules_routes;
}

// reset router
export function resetRouter() {
  console.log('resetRouter');
  // 白名单应该包含基本静态路由
  const WHITE_NAME_LIST: string[] = [];
  const getRouteNames = (array: any[]) =>
    array.forEach((item) => {
      WHITE_NAME_LIST.push(item.name);
      getRouteNames(item.children || []);
    });
  const router = getCurrentRouter();
  getRouteNames(basicRoutes);
  router.getRoutes().forEach((route) => {
    const { name } = route;
    if (name && !WHITE_NAME_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name);
    }
  });
}
