const hostedPermissionStore = {
  getPermCodeList: [],
  getBackMenuList: [],
  getFrontMenuList: [],
  getPlatformRoleMenuList: [],
  getLastBuildMenuTime: 0,
  getIsDynamicAddedRoute: true,
  getCurrentProject: 'online-form',
  getCurrentHomePath: '/designer',
  getIOTPermission: false,
  setCurrentProject: () => undefined,
  setPermCodeList: () => undefined,
  setBackMenuList: () => undefined,
  setFrontMenuList: () => undefined,
  setPlatformRoleMenuList: () => undefined,
  setLastBuildMenuTime: () => undefined,
  setDynamicAddedRoute: () => undefined,
  setIOTPermission: async () => undefined,
  buildRoutesAction: async () => [],
  buildMenusAction: async () => [],
};

export function usePermissionStore() {
  return hostedPermissionStore;
}

export function usePermissionStoreWithOut() {
  return hostedPermissionStore;
}
