import type { Menu, MenuModule } from '/@/router/types';
import type { RouteRecordNormalized } from 'vue-router';

import { useAppStoreWithOut } from '/@/store/modules/app';
import { usePermissionStore } from '/@/store/modules/permission';
import { transformMenuModule, getAllParentPath } from '/@/router/helper/menuHelper';
import { filter } from '/@/utils/helper/treeHelper';
import { isUrl } from '/@/utils/is';
import { PermissionModeEnum } from '/@/enums/appEnum';
import { pathToRegexp } from 'path-to-regexp';
import { getCurrentRouter } from '/@/hooks/web/useRouter';
// import { router } from '/@portal/router';
import { cloneDeep } from 'lodash-es';

const modules = import.meta.glob<true, string, any>('./modules/**/*.ts', { eager: true });
const menuModules: MenuModule[] = [];

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  menuModules.push(...modList);
});

// ===========================
// ==========Helper===========
// ===========================

const getPermissionMode = () => {
  const appStore = useAppStoreWithOut();
  return appStore.getProjectConfig.permissionMode;
};
const isBackMode = () => {
  return getPermissionMode() === PermissionModeEnum.BACK;
};

const isRouteMappingMode = () => {
  return getPermissionMode() === PermissionModeEnum.ROUTE_MAPPING;
};

const isPlatformRoleMappingMode = () => {
  return getPermissionMode() === PermissionModeEnum.PLATFORM_ROLE;
};

const isRoleMode = () => {
  return getPermissionMode() === PermissionModeEnum.ROLE;
};

const staticMenus: Menu[] = [];
(() => {
  menuModules.sort((a, b) => {
    return (a.orderNo || 0) - (b.orderNo || 0);
  });

  for (const menu of menuModules) {
    staticMenus.push(transformMenuModule(menu));
  }
})();

async function getAsyncMenus() {
  const permissionStore = usePermissionStore();
  //递归过滤所有隐藏的菜单
  const menuFilter = (items) => {
    return items.filter((item: Menu) => {
      const show = !item.meta?.hideMenu && !item.hideMenu;
      if (show && item.children) {
        // ! 解决平台设置-主题设置-导航菜单切换 导致页面卡死， 先这么改，后面有问题再说
        item.children = menuFilter(cloneDeep(item.children));
        //父菜单如果没有子菜单就一起隐藏了
        // show = !!item.children?.length;
      }
      return show;
    });
  };
  if (isBackMode()) {
    // ! 解决平台设置-主题设置-导航菜单切换 导致页面卡死， 先这么改，后面有问题再说
    return menuFilter(cloneDeep(permissionStore.getBackMenuList));
  }
  if (isRouteMappingMode()) {
    // ! 解决平台设置-主题设置-导航菜单切换 导致页面卡死， 先这么改，后面有问题再说
    return menuFilter(cloneDeep(permissionStore.getFrontMenuList));
  }

  if (isPlatformRoleMappingMode()) {
    // ! 解决平台设置-主题设置-导航菜单切换 导致页面卡死， 先这么改，后面有问题再说
    return menuFilter(cloneDeep(permissionStore.getPlatformRoleMenuList));
  }

  return staticMenus;
}

export const getMenus = async (): Promise<Menu[]> => {
  const menus = await getAsyncMenus();
  console.log('menus 112233', menus);
  if (isRoleMode()) {
    const router = getCurrentRouter();
    const routes = router.getRoutes();
    return filter(menus, basicFilter(routes));
  }
  return menus;
};

export async function getCurrentParentPath(currentPath: string) {
  const menus = await getAsyncMenus();
  const allParentPath = await getAllParentPath(menus, currentPath);
  return allParentPath?.[0];
}

// Get the level 1 menu, delete children
export async function getShallowMenus(): Promise<Menu[]> {
  const menus = await getAsyncMenus();
  const shallowMenuList = menus.map((item) => ({ ...item, children: undefined }));
  if (isRoleMode()) {
    const router = getCurrentRouter();
    const routes = router.getRoutes();
    return shallowMenuList.filter(basicFilter(routes));
  }
  return shallowMenuList;
}

// Get the children of the menu
export async function getChildrenMenus(parentPath: string) {
  const menus = await getMenus();
  const parent = menus.find((item) => item.path === parentPath);
  if (!parent || !parent.children || !!parent?.meta?.hideChildrenInMenu) {
    return [] as Menu[];
  }
  if (isRoleMode()) {
    const router = getCurrentRouter();
    const routes = router.getRoutes();
    return filter(parent.children, basicFilter(routes));
  }
  return parent.children;
}

function _listTree(list, result: any = []) {
  list.forEach((item) => {
    result.push(item);
    if (item.type === 'CATALOG' && item.children) {
      _listTree(item.children, result);
    }
  });
  return result;
}
/**
 * 获取菜单第一个子节点
 * @returns
 */
export async function getFirstMenus() {
  const menus = await getMenus();
  return _listTree(menus).find(
    (m) =>
      (m.type === 'STANDARD' && m.openMode === 'PRESENT') ||
      (m.type === 'LINK' && m.openMode === 'IFRAME'),
  );
}
function basicFilter(routes: RouteRecordNormalized[]) {
  return (menu: Menu) => {
    const matchRoute = routes.find((route) => {
      if (isUrl(menu.path)) return true;

      if (route.meta?.carryParam) {
        return pathToRegexp(route.path).test(menu.path);
      }
      const isSame = route.path === menu.path;
      if (!isSame) return false;

      if (route.meta?.ignoreAuth) return true;

      return isSame || pathToRegexp(route.path).test(menu.path);
    });

    if (!matchRoute) return false;
    menu.icon = (menu.icon || matchRoute.meta.icon) as string;
    menu.meta = matchRoute.meta;
    return true;
  };
}
