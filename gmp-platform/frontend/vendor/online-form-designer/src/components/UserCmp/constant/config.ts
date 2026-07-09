import { UserEnabledEnum, ButtonTypeEnum, ButtonLocationTypeEnum, PlatformEnum } from './interface';
import { useI18n } from '/@/hooks/web/useI18n';
import { cloneDeep } from 'lodash-es';
import type { IButtonConfig, IButtonProps } from '../types/index.d';
import { usePermission } from '/@/hooks/web/usePermission';
import { BasicAction, CustomAction } from '/@/enums/authActionEnum';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '/@/store/modules/user';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { DhrPermissionEnum } from '/@/perms/index';

const { t } = useI18n();
const appInfoStore = useAppInfoStore();
const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');
const userStore = useUserStore();
const { getSecurityConfig, getOrgDelUser } = useRootSetting();

const buttonConfig: IButtonConfig = {
  [ButtonTypeEnum.Create]: {
    key: ButtonTypeEnum.Create,
    name: t('sys.new'),
    icon: 'add-user',
    locationTypes: [ButtonLocationTypeEnum.ListHeadButton],
    style: {
      type: 'primary',
    },
    isShow: () => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.Insert)
        : hasPermission(BasicAction.Insert);
      return value ?? false;
    },
  },
  [ButtonTypeEnum.Add]: {
    key: ButtonTypeEnum.Add,
    name: t('sys.add'),
    icon: 'add-user',
    locationTypes: [ButtonLocationTypeEnum.ListHeadButton],
    style: {
      type: 'primary',
    },
    isShow: () => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.Insert)
        : hasPermission(BasicAction.Insert);
      return value ?? false;
    },
  },
  [ButtonTypeEnum.Import]: {
    key: ButtonTypeEnum.Import,
    name: t('sys.component.userCmp.import'),
    locationTypes: [ButtonLocationTypeEnum.ListHeadButton],
    useCustomizeCmp: true,
    isShow: () => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.Import)
        : hasPermission(BasicAction.Import);
      return value ?? false;
    },
  },
  [ButtonTypeEnum.Export]: {
    key: ButtonTypeEnum.Export,
    name: t('sys.component.userCmp.export'),
    icon: 'export-icon',
    locationTypes: [ButtonLocationTypeEnum.ListHeadButton],
    style: {
      type: 'default',
    },
    isShow: () => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.Export)
        : hasPermission(BasicAction.Export);
      return value ?? false;
    },
  },
  [ButtonTypeEnum.Edit]: {
    key: ButtonTypeEnum.Edit,
    name: t('sys.component.userCmp.edit'),
    locationTypes: [ButtonLocationTypeEnum.ListRowButton],
    isShow: () => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.Update)
        : hasPermission(BasicAction.Update);
      return value ?? false;
    },
  },
  [ButtonTypeEnum.ResetPwd]: {
    key: ButtonTypeEnum.ResetPwd,
    name: t('sys.component.userCmp.resetPwd'),
    style: {
      color: 'text',
    },
    locationTypes: [ButtonLocationTypeEnum.ListRowButton, ButtonLocationTypeEnum.ListBatchButton],
    tips: {
      row: t('sys.component.userCmp.batchResetPwdTip'),
      rowInfo: (name: string) =>
        t('sys.component.userCmp.resetPwdTip', { name: name ? `「${name}」` : '' }),
    },
    isShow: (info: Recordable<any>) => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.ResetPwd)
        : hasPermission(CustomAction.ResetPassword);
      const isCurrentUser = userStore?.userInfo?.userId !== info.id;

      return (isCurrentUser && value) ?? false;
    },
  },
  [ButtonTypeEnum.ResetSignPwd]: {
    key: ButtonTypeEnum.ResetSignPwd,
    name: t('sys.component.userCmp.resetSinPwd'),
    style: {
      color: 'text',
    },
    locationTypes: [ButtonLocationTypeEnum.ListRowButton, ButtonLocationTypeEnum.ListBatchButton],
    tips: {
      row: t('sys.component.userCmp.batchResetSignPwdTip'),
      rowInfo: (name: string) =>
        t('sys.component.userCmp.resetSignPwdTips', { name: name ? `「${name}」` : '' }),
    },
    isShow: (info: Recordable<any>) => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.ResetSignPwd)
        : hasPermission(CustomAction.ResetPassword);
      const settings = getSecurityConfig.value.enableSignPassword == 1;
      const isCurrentUser = userStore?.userInfo?.userId !== info.id;

      return (isCurrentUser && value && settings) ?? false;
    },
  },
  [ButtonTypeEnum.Trace]: {
    key: ButtonTypeEnum.Trace,
    name: t('sys.component.userCmp.dataTrace'),
    locationTypes: [ButtonLocationTypeEnum.ListRowButton],
    isShow: () => {
      return true;
    },
  },
  [ButtonTypeEnum.Enable]: {
    key: ButtonTypeEnum.Enable,
    name: t('sys.component.userCmp.enable'),
    style: {
      color: 'success',
    },
    locationTypes: [ButtonLocationTypeEnum.ListRowButton],
    isShow: (info: Recordable<any>, opts) => {
      const { attr } = opts || {};
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, 'Update')
        : hasPermission(BasicAction.Update);
      const isCurrentUser = userStore?.userInfo?.userId !== info.id;
      const isHasRole = (isCurrentUser && value) ?? false;
      if (!isHasRole) {
        return false;
      }

      if (
        attr &&
        (info[attr] === UserEnabledEnum.ENABLE || info[attr] === UserEnabledEnum.UN_ACTIVE)
      ) {
        return false;
      }
      return true;
    },
    tips: {
      row: (name: string) => t('sys.confirmExecution'),
    },
  },
  [ButtonTypeEnum.Disable]: {
    key: ButtonTypeEnum.Disable,
    name: t('sys.component.userCmp.unEnable'),
    style: {
      color: 'text',
    },
    locationTypes: [ButtonLocationTypeEnum.ListRowButton],
    isShow: (info: Recordable<any>, opts) => {
      const { attr, isBatch } = opts || {};
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, 'Update')
        : hasPermission(BasicAction.Update);
      const isCurrentUser = userStore?.userInfo?.userId !== info.id;
      const isHasRole = (isCurrentUser && value) ?? false;
      if (!isHasRole) {
        return false;
      }

      if (isBatch) {
        return true;
      }

      if (
        attr &&
        (info[attr] === UserEnabledEnum.UN_ENABLE || info[attr] === UserEnabledEnum.UN_ACTIVE)
      ) {
        return false;
      }

      return true;
    },
    tips: {
      row: (name: string) => t('sys.component.userCmp.rowUnEnableTip'),
      batch: t('sys.component.userCmp.batchUnEnableTip'),
    },
  },
  [ButtonTypeEnum.Delete]: {
    key: ButtonTypeEnum.Delete,
    name: t('sys.component.userCmp.delete'),
    locationTypes: [ButtonLocationTypeEnum.ListRowButton, ButtonLocationTypeEnum.ListBatchButton],
    tips: {
      row: t('sys.confirmExecution'),
      batch: t('sys.confirmExecution'),
    },
    isShow: (info: Recordable<any>) => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.Delete)
        : hasPermission(BasicAction.Delete);

      return (getOrgDelUser.value && value && info.enabled == 2) ?? false;
    },
  },
  [ButtonTypeEnum.Detach]: {
    key: ButtonTypeEnum.Detach,
    name: t('sys.component.userCmp.detach'),
    locationTypes: [ButtonLocationTypeEnum.ListRowButton, ButtonLocationTypeEnum.ListBatchButton],
    style: {
      color: 'error',
    },
    tips: {
      row: (name: string, platformType?: string) => {
        if (platformType === PlatformEnum.TENANT_MANAGE_USER) {
          return t('sys.component.userCmp.rowTenantDetachTip', { name });
        }
        return t('sys.component.userCmp.rowDetachTip', { name });
      },
      batch: (platformType) => {
        if (platformType === PlatformEnum.TENANT_MANAGE_USER) {
          return t('sys.component.userCmp.batchTenantDetachTip');
        }
        return t('sys.component.userCmp.batchDetachTip');
      },
    },
    isShow: () => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, 'Update')
        : hasPermission(BasicAction.Update);
      return value ?? false;
    },
  },
  [ButtonTypeEnum.Move]: {
    key: ButtonTypeEnum.Move,
    name: t('sys.component.userCmp.move'),
    locationTypes: [ButtonLocationTypeEnum.ListBatchButton],
    isShow: () => {
      const vueRouter = useRouter();
      const { hasPermission } = usePermission();
      const value = inEDHRApp.value
        ? getPermissionByKey(vueRouter.currentRoute.value.name, DhrPermissionEnum.Update)
        : hasPermission(BasicAction.Update);
      return value ?? false;
    },
  },
};

/** 获取按钮组 */
export const getTableButton = (btnKeys: string[]): IButtonProps[] => {
  return btnKeys.map((key: string) => cloneDeep(buttonConfig[key]));
};

/** 按钮分组 */
export const handleButtonListDataBack = (target: IButtonProps[] = []) => {
  let data: IButtonProps[] = [];
  if (!target) {
    return [];
  }
  target.forEach((item: IButtonProps) => {
    if (item.locationTypes?.length) {
      for (let index = 0; index < item.locationTypes.length; index += 1) {
        const element = item.locationTypes[index];
        data.push({ ...item, locationType: element });
      }
    } else {
      data = [...target];
    }
  });
  return data;
};

export const getUserIdList = (info, attr, splicer?) => {
  const ids = [].concat(info).map((data) => data?.[attr]);
  if (splicer) {
    return ids.join(splicer);
  }
  return ids;
};
