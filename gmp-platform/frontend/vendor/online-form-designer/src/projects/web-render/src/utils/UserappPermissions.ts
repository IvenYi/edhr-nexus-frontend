import { getDesignerCommonUserInfo } from '/@/apis/gct-apaas/DesignerCommonController';

export { BasicAction } from '/@/enums/authActionEnum';
/**
 * 权限相关逻辑
 */
class appUserPermissions {
  static userPermissions = {
    appSuperAdmin: 0,
    permissions: {},
  };
  static async initPremission() {
    const res = await getDesignerCommonUserInfo();
    Object.assign(this.userPermissions, {
      ...res,
      permissions: res?.permissions
        ? res?.permissions.reduce((map, item) => {
            map[item] = true;
            return map;
          }, {})
        : {},
    });
  }
  static hasAllPermissions() {
    return !!this.userPermissions.appSuperAdmin || !!this.userPermissions.permissions['POINT.*'];
  }
  static getPermissionByKey(pageId: string, key?: string): boolean {
    if (this.hasAllPermissions()) return true;
    if (!key) {
      return this.userPermissions.permissions[pageId];
    }
    const uKey = `${pageId}.${key}`;
    const pageKey = `${pageId}.*`;
    return this.userPermissions.permissions[uKey] || this.userPermissions.permissions[pageKey];
  }
}

export const initPremission = appUserPermissions.initPremission.bind(appUserPermissions);
export const getPermissionByKey = appUserPermissions.getPermissionByKey.bind(appUserPermissions);
