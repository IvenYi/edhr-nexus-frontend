import type { AppRouteRecordRaw, Menu } from '/@/router/types';

import { defineStore } from 'pinia';
import { store } from '/@/store';
import { useI18n } from '/@/hooks/web/useI18n';
import { useUserStore } from './user';
import { useAppStoreWithOut } from './app';
import { toRaw } from 'vue';
import { flatMultiLevelRoutes } from '/@/router/helper/routeHelper';
import { transformRouteToMenu } from '/@/router/helper/menuHelper';

import projectSetting from '/@/settings/projectSetting';

import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';

import { filter, findNode } from '/@/utils/helper/treeHelper';
import { getPermCode } from '/@/api/sys/user';

import { useMessage } from '/@/hooks/web/useMessage';
import { PageEnum } from '/@/enums/pageEnum';
import { getProjectRoutesModules } from '/@/hooks/web/useRouter';
import { getAsyncRouter } from '/@web-render/router/asyncRouter';
import { PermissionModeEnum, ProjectName } from '@gct-paas/core';
import { getLicenseModuleAuth } from '/@/apis/gct-platform/LicenseController';

interface PermissionState {
  // Permission code list
  // 权限代码列表
  permCodeList: string[] | number[];
  // Whether the route has been dynamically added
  // 路由是否动态添加
  isDynamicAddedRoute: boolean;
  // To trigger a menu update
  // 触发菜单更新
  lastBuildMenuTime: number;
  // Backstage menu list
  // 后台菜单列表
  backMenuList: Menu[];
  // 菜单列表
  frontMenuList: Menu[];
  platformRoleMenuList: Menu[];
  //当前项目标识
  currentProject: `${ProjectName}`;
  currentHomePath: string;
  // 设备互联权限
  IOTPermission: boolean;
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    // 权限代码列表
    permCodeList: [],
    // Whether the route has been dynamically added
    // 路由是否动态添加
    isDynamicAddedRoute: false,
    // To trigger a menu update
    // 触发菜单更新
    lastBuildMenuTime: 0,
    // Backstage menu list
    // 后台菜单列表
    backMenuList: [],
    // menu List
    // 菜单列表
    frontMenuList: [],
    platformRoleMenuList: [],
    //当前项目标识
    currentProject: 'portal',
    currentHomePath: '/home',
    // 设备互联权限
    IOTPermission: false,
  }),
  getters: {
    getPermCodeList(state): string[] | number[] {
      return state.permCodeList;
    },
    getBackMenuList(state): Menu[] {
      return state.backMenuList;
    },
    getFrontMenuList(state): Menu[] {
      return state.frontMenuList;
    },
    getPlatformRoleMenuList(state): Menu[] {
      return state.platformRoleMenuList;
    },
    getLastBuildMenuTime(state): number {
      return state.lastBuildMenuTime;
    },
    getIsDynamicAddedRoute(state): boolean {
      return state.isDynamicAddedRoute;
    },
    getCurrentProject(state) {
      return state.currentProject;
    },
    isInPlatform(state) {
      return [
        ProjectName.PORTAL,
        ProjectName.BACKEND_MANAGEMENT,
        ProjectName.DEVELOPER_CENTER,
        ProjectName.TENANT_CENTER,
      ].includes(state.currentProject as ProjectName);
    },
    getCurrentHomePath(state) {
      return state.currentHomePath;
    },
    getIOTPermission(state) {
      return state.IOTPermission;
    },
  },
  actions: {
    setCurrentProject(projectName: `${ProjectName}`) {
      this.currentProject = projectName;
    },
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList;
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list;
      list?.length > 0 && this.setLastBuildMenuTime();
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list;
    },

    setPlatformRoleMenuList(list: Menu[]) {
      this.platformRoleMenuList = list;
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime();
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added;
    },
    async setIOTPermission() {
      this.IOTPermission = (await getLicenseModuleAuth({ module: 'IOT' })) || false;
    },
    resetState(): void {
      this.isDynamicAddedRoute = false;
      this.permCodeList = [];
      this.backMenuList = [];
      this.lastBuildMenuTime = 0;
    },
    async changePermissionCode() {
      const codeList = await getPermCode();
      this.setPermCodeList(codeList);
    },

    // 构建路由
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      const { t } = useI18n();
      const userStore = useUserStore();
      const appStore = useAppStoreWithOut();

      let routes: AppRouteRecordRaw[] = [];
      const roleList = toRaw(userStore.getRoleList) || [];
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig;

      // 路由过滤器 在 函数filter 作为回调传入遍历使用
      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // 抽出角色
        const { roles } = meta || {};
        if (!roles) return true;
        // 进行角色权限判断
        return roleList.some((role) => roles.includes(role));
      };

      /**
       * 平台角色权限过滤
       * 1.超管（平台超管 or 租户超管）
       * 2.菜单访问权限
       * 3.菜单依赖操作权限（操作权限 or .*）
       * @param route
       * @returns
       */
      const platformRoleRouteFilter = (route: AppRouteRecordRaw): boolean => {
        const { name, meta } = route;
        // todo 临时处理 过滤权限跳过个人设置相关 转移至 meta中配置
        if (name.startsWith('UserCenter')) return true;
        const { standbyAuthName } = meta || {};
        let access = false;
        if (this.currentProject === ProjectName.BACKEND_MANAGEMENT) {
          const keys = standbyAuthName?.split('.');
          access = (userStore.getUserInfo?.globalSuperAdmin ||
            userStore.getUserPermissions![`BACKEND_MANAGEMENT.${name}`] ||
            (standbyAuthName &&
              (userStore.getUserPermissions![`BACKEND_MANAGEMENT.${keys?.join('.')}`] ||
                userStore.getUserPermissions![`BACKEND_MANAGEMENT.${keys![0]}.*`]))) as boolean;
        } else if (this.currentProject === ProjectName.TENANT_CENTER) {
          const keys = standbyAuthName?.split('.');
          access = (userStore.getTenantUserInfo?.globalSuperAdmin ||
            userStore.getTenantUserInfo?.tenantSuperAdmin ||
            userStore.getTenantUserPermissions![`TENANT_CENTER.${name}`] ||
            (standbyAuthName &&
              (userStore.getTenantUserPermissions![`TENANT_CENTER.${keys?.join('.')}`] ||
                userStore.getTenantUserPermissions![`TENANT_CENTER.${keys![0]}.*`]))) as boolean;
        }
        return access;
      };

      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // ignoreRoute 为true 则路由仅用于菜单生成，不会在实际的路由表中出现
        const { ignoreRoute } = meta || {};
        // arr.filter 返回 true 表示该元素通过测试
        return !ignoreRoute;
      };

      /**
       * @description 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return;
        let homePath: string = this.currentHomePath || PageEnum.BASE_HOME;

        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/';
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route;
            const currentPath = path.startsWith('/') ? path : parentPath + path;
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string;
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true });
                throw new Error('end');
              }
            }
            children && children.length > 0 && patcher(children, currentPath);
          });
        }

        try {
          patcher(routes);
        } catch (e) {
          // 已处理完毕跳出循环
        }
        return;
      };

      /** 没有授权时过滤设备互联 */
      // 深度拷贝并过滤
      const removeDeviceInterconnection = (menuData) => {
        return menuData.map((item) => {
          // 深度拷贝当前项
          const newItem = { ...item };

          // 如果是 integration 路由，过滤其子路由
          if (newItem.path === '/integration' && newItem.children) {
            newItem.children = newItem.children.filter(
              (child) =>
                !['/integration/device-interconnection', 'sys.menu.deviceInterconnection'].includes(
                  child.path || child.name,
                ),
            );
          }

          return newItem;
        });
      };
      let asyncRoutes: AppRouteRecordRaw[] = [];
      // const { asyncRoutes } = await import(
      //   `./../modules/../../projects/${this.currentProject}/src/router/routes/index.ts`
      // );
      switch (permissionMode) {
        // 角色权限
        case PermissionModeEnum.ROLE:
          asyncRoutes = await getProjectRoutesModules();
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由根据角色权限过滤
          routes = routes.filter(routeFilter);
          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        // 路由映射， 默认进入该case
        case PermissionModeEnum.ROUTE_MAPPING:
          asyncRoutes = await getProjectRoutesModules();
          const hasITOLicense = await this.setIOTPermission();
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由再次根据角色权限过滤
          routes = routes.filter(routeFilter);

          // 将路由转换成菜单
          let menuList = transformRouteToMenu(routes, true);
          // 移除掉 ignoreRoute: true 的路由 非一级路由
          routes = filter(routes, routeRemoveIgnoreFilter);
          // 移除掉 ignoreRoute: true 的路由 一级路由；
          routes = routes.filter(routeRemoveIgnoreFilter);
          // 判断设备权限是否授权
          menuList = this.IOTPermission ? menuList : removeDeviceInterconnection(menuList);

          // 对菜单进行排序
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });

          // // 设置菜单列表
          this.setFrontMenuList(menuList);

          // 设置首页;
          this.currentHomePath =
            findNode(menuList, (route) => {
              return route?.meta?.standbyHomePage;
            })?.path ?? PageEnum.BASE_HOME;

          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        //  如果确定不需要做后台动态权限，请在下方注释整个判断
        case PermissionModeEnum.BACK:
          const { createMessage } = useMessage();
          console.log('back', routes);
          createMessage.loading({
            content: t('sys.app.menuLoading'),
            duration: 1,
          });

          // !Simulate to obtain permission codes from the background,
          // 模拟从后台获取权限码，
          // this function may only need to be executed once, and the actual project can be put at the right time by itself
          // 这个功能可能只需要执行一次，实际项目可以自己放在合适的时间

          // // await this.changePermissionCode();
          const { treeMenu, treeRouter } = await getAsyncRouter();
          // console.log(treeMenu, treeRouter);
          // //  console.log(roleList)
          // // Dynamically introduce components
          // // 动态引入组件
          // routeList = transformObjToRoute(routeList);

          // //  Background routing to menu structure
          // //  后台路由到菜单结构
          // const backMenuList = transformRouteToMenu(treeMenu);
          this.setBackMenuList(treeMenu);

          // // remove meta.ignoreRoute item
          // // 删除 meta.ignoreRoute 项
          // routes = filter(treeRouter, routeRemoveIgnoreFilter);
          // routes = routes.filter(routeRemoveIgnoreFilter);

          // routeList = flatMultiLevelRoutes(routeList);
          console.log('treeRouter', treeRouter);
          routes = [PAGE_NOT_FOUND_ROUTE, ...treeRouter];
          break;
        case PermissionModeEnum.PLATFORM_ROLE:
          asyncRoutes = await getProjectRoutesModules();
          routes = filter(asyncRoutes, platformRoleRouteFilter);
          //处理二级路由重定向地址问题
          routes.forEach((g) => {
            g.children?.forEach((m) => {
              const re = m.children?.find((item) => item.meta.standbyHomePage);
              if (re) {
                m.redirect = g.path + '/' + m.path + '/' + re.path;
              }
            });
          });
          // 将路由转换成菜单
          const platformRoleMenus = transformRouteToMenu(routes, true);
          // 移除掉 ignoreRoute: true 的路由 非一级路由
          routes = filter(routes, routeRemoveIgnoreFilter);
          // 移除掉 ignoreRoute: true 的路由 一级路由；
          routes = routes.filter(routeRemoveIgnoreFilter);

          // 对菜单进行排序
          platformRoleMenus.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });

          // 设置菜单列表
          this.setPlatformRoleMenuList(platformRoleMenus);

          // 设置首页
          this.currentHomePath =
            findNode(platformRoleMenus, (route) => route?.meta?.standbyHomePage)?.path ??
            PageEnum.BASE_HOME;

          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);

          console.log(routes);

          break;
      }

      routes.push(ERROR_LOG_ROUTE);
      patchHomeAffix(routes);

      return routes;
    },
  },
});

// Need to be used outside the setup
// 需要在设置之外使用
export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
