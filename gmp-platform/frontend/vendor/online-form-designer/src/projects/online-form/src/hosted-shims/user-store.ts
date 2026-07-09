const hostedUserStore = {
  getToken: '',
  getUserInfo: {},
  getUserPermissions: {},
  getRoleList: [],
  getSessionTimeout: false,
  getTenant: undefined,
  getTenantUserInfo: {},
  getTenantUserPermissions: {},
  getAppUserPermissions: { appSuperAdmin: 0, permissions: {} },
  setToken: () => undefined,
  setUserInfo: () => undefined,
  setRoleList: () => undefined,
  setSessionTimeout: () => undefined,
  setTenant: () => undefined,
  logout: async () => undefined,
  afterLoginAction: async () => undefined,
  getUserInfoAction: async () => ({}),
};

export function useUserStore() {
  return hostedUserStore;
}

export function useUserStoreWithOut() {
  return hostedUserStore;
}
