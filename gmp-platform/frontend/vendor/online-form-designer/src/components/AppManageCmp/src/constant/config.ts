import {
  AppTabsMenuEnum,
  ButtonTypeEnum,
  ButtonLocationTypeEnum,
  AppStatusEnum,
  AppDetailTabEnum,
  UserRoleReqEnum,
  PlatformEnum,
} from './interface';
import { cloneDeep } from 'lodash-es';
import { useI18n } from '/@/hooks/web/useI18n';
import { useUserStoreWithOut } from '/@/store/modules/user';

import type { IButtonConfig } from '../types/index.d';

const { t } = useI18n();
const userStore = useUserStoreWithOut();

export const buttonConfig: IButtonConfig = {
  [ButtonTypeEnum.Design]: {
    key: ButtonTypeEnum.Design,
    name: t('sys.developer.appCenter.design'),
    locationType: ButtonLocationTypeEnum.CardTileButton,
    style: {
      type: 'primary',
      ghost: true,
      iconKey: 'icon-sheji-2',
    },
    isShow: (info: Recordable<any>, opts) => {
      const { attr, tabActiveKey, platformType } = opts || {};
      if (
        [
          AppStatusEnum.MANUAL_LOCKED,
          AppStatusEnum.PROGRAM_LOCKED,
          AppStatusEnum.INACTIVE,
        ].includes(info[attr])
      ) {
        return false;
      }

      // 租户管理后台不需要显示设计按钮
      if (platformType === PlatformEnum.PLATFORM_TENANT_CENTER) {
        return false;
      }

      // 如果是全部应用tab，如果当前用户不是应用管理员，不需要显示设计按钮
      if (
        tabActiveKey === AppTabsMenuEnum.AllApp &&
        userStore.getTenantUserInfo?.tenantDeveloperType !== 'APPLICATION_ADMIN'
      ) {
        return false;
      }

      // 如果是在我的协作tab，如果当前用户是查看人员，不需要显示设计按钮
      if (
        tabActiveKey === AppTabsMenuEnum.MineCollaborate &&
        info.role === UserRoleReqEnum.VIEWER
      ) {
        return false;
      }

      // 如果是eDHR应用，不需要显示设计按钮
      // if (['eDHR'].includes(info?.suiteKey)) {
      //   return false;
      // }

      return true;
    },
  },
  [ButtonTypeEnum.Edit]: {
    key: ButtonTypeEnum.Edit,
    name: t('sys.developer.appCenter.editAppInfo'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    isShow: (info: Recordable<any>, opts) => {
      const { attr } = opts || {};
      // if (['eDHR'].includes(info?.suiteKey)) {
      //   return false;
      // }
      if (info[attr] === AppStatusEnum.INACTIVE) {
        return false;
      }
      return true;
    },
  },
  [ButtonTypeEnum.Preview]: {
    key: ButtonTypeEnum.Preview,
    name: t('sys.developer.appCenter.preview'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    // locationType: (info: Recordable<any>) => {
    //   return ['eDHR'].includes(info?.suiteKey)
    //     ? ButtonLocationTypeEnum.CardTileButton
    //     : ButtonLocationTypeEnum.CardDropButton;
    // },
    isShow: (info: Recordable<any>, opts) => {
      const { attr, appActiveKey } = opts || {};
      // console.log(info[attr], opts);
      if (info[attr] === AppStatusEnum.INACTIVE) {
        return false;
      }
      return appActiveKey !== 'BI'; // BI应用不需要显示预览按钮
    },
  },
  [ButtonTypeEnum.Lock]: {
    key: ButtonTypeEnum.Lock,
    name: t('sys.disabled'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    tableStyle: {
      color: 'error',
    },
    isShow: (info: Recordable<any>, opts) => {
      const { attr, appActiveKey } = opts || {};
      // console.log('info', info, 'attr', attr);
      if ([AppStatusEnum.MANUAL_LOCKED, AppStatusEnum.INACTIVE].includes(info[attr])) {
        return false;
      }
      return appActiveKey !== 'BI'; // BI应用不需要显示禁用按钮
      // 如果是eDHR应用，不需要显示设计按钮
      // if (['eDHR'].includes(info?.suiteKey)) {
      //   return false;
      // }
    },
    tips: {
      batch: t('sys.developer.appCenter.batchDisabledTip'),
    },
  },
  [ButtonTypeEnum.Unlock]: {
    key: ButtonTypeEnum.Unlock,
    name: t('sys.enabled'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    isShow: (info: Recordable<any>, opts) => {
      const { attr, appActiveKey } = opts || {};
      if ([AppStatusEnum.HEALTHY, AppStatusEnum.INACTIVE].includes(info[attr])) {
        return false;
      }
      // 如果是eDHR应用，不需要显示设计按钮
      // if (['eDHR'].includes(info?.suiteKey)) {
      //   return false;
      // }
      return appActiveKey !== 'BI'; // BI应用不需要显示禁用按钮
    },
    tips: {
      batch: t('sys.developer.appCenter.batchEnabledTip'),
    },
  },
  [ButtonTypeEnum.Detail]: {
    key: ButtonTypeEnum.Detail,
    name: t('sys.developer.appCenter.detail'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    style: {
      class: 'opacity-style',
    },
    tableStyle: {
      class: 'opacity-style',
    },
    isShow: (info: Recordable<any>, opts) => {
      const { attr } = opts || {};
      if (info[attr] === AppStatusEnum.INACTIVE) {
        return false;
      }
      return true;
    },
  },
  [ButtonTypeEnum.Delete]: {
    key: ButtonTypeEnum.Delete,
    name: t('sys.developer.appCenter.delete'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    style: {
      class: 'delete-style',
    },
    tableStyle: {
      color: 'error',
    },
    isShow: (info: Recordable<any>, opts) => {
      // const { attr } = opts || {};
      // if (info[attr] === AppStatusEnum.MANUAL_LOCKED) {
      //   return false;
      // }
      // 如果是eDHR应用，不需要显示设计按钮
      // if (['eDHR'].includes(info?.suiteKey)) {
      //   return false;
      // }
      return true;
    },
    tips: {
      batch: t('sys.developer.appCenter.batchDeleteTip'),
    },
  },
  [ButtonTypeEnum.Activate]: {
    key: ButtonTypeEnum.Activate,
    name: t('sys.activate'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    style: {
      class: 'activate-style',
    },
    isShow: (info: Recordable<any>, opts) => {
      const { attr } = opts || {};
      return info[attr] === AppStatusEnum.INACTIVE;
    },
  },
  [ButtonTypeEnum.Rest]: {
    key: ButtonTypeEnum.Rest,
    name: t('sys.developer.appCenter.rest'),
    locationType: ButtonLocationTypeEnum.CardTileButton,
    style: {
      type: 'default',
      iconKey: 'icon-huanyuan',
    },
  },
  [ButtonTypeEnum.Clear]: {
    key: ButtonTypeEnum.Clear,
    name: t('sys.developer.appCenter.completelyDelete'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    style: {
      class: 'delete-style',
    },
    tableStyle: {
      color: 'error',
    },
    tips: {
      batch: t('sys.developer.appCenter.batchCompletelyDeleteTip'),
    },
  },
  [ButtonTypeEnum.Add]: {
    key: ButtonTypeEnum.Add,
    name: t('sys.developer.appCenter.add'),
    icon: 'add-user',
    locationType: ButtonLocationTypeEnum.CardTileButton,
    style: {
      type: 'primary',
    },
    isShow: (info: Recordable<any>, opts) => {
      const { appDetail, platformType } = opts || {};
      // 只能应用管理员和维护者有编辑权限
      if (userStore.getTenantUserInfo?.tenantDeveloperType === 'APPLICATION_ADMIN') {
        return true;
      }

      if (appDetail?.appMember?.userId === userStore.getUserInfo.userId) {
        return true;
      }

      // 如果是租户管理员
      if (
        platformType === PlatformEnum.PLATFORM_TENANT_CENTER &&
        userStore.getTenantUserInfo?.tenantManager === 1
      ) {
        return true;
      }
      // 如果是eDHR应用，不需要显示设计按钮
      // if (['eDHR'].includes(info?.suiteKey)) {
      //   return false;
      // }

      return false;
    },
  },
  [ButtonTypeEnum.Transfer]: {
    key: ButtonTypeEnum.Transfer,
    name: t('sys.developer.appCenter.transfer'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    isShow: (info: Recordable<any>, opts) => {
      const { attr, appDetail, platformType } = opts || {};
      // 只能应用管理员和维护者有编辑权限
      if (
        info[attr] === UserRoleReqEnum.MAINTAINER &&
        (userStore.getTenantUserInfo?.tenantDeveloperType === 'APPLICATION_ADMIN' ||
          appDetail?.appMember?.userId === userStore.getUserInfo.userId ||
          (platformType === PlatformEnum.PLATFORM_TENANT_CENTER &&
            userStore.getTenantUserInfo?.tenantManager === 1))
      ) {
        return true;
      }
      // 如果是eDHR应用，不需要显示设计按钮
      // if (['eDHR'].includes(info?.suiteKey)) {
      //   return false;
      // }
      return false;
    },
  },
  [ButtonTypeEnum.Detach]: {
    key: ButtonTypeEnum.Detach,
    name: t('sys.developer.appCenter.detach'),
    locationType: ButtonLocationTypeEnum.CardDropButton,
    isShow: (info: Recordable<any>, opts) => {
      const { attr, appDetail, platformType } = opts || {};
      // 只能应用管理员和维护者有编辑权限
      if (
        info[attr] !== UserRoleReqEnum.MAINTAINER &&
        (userStore.getTenantUserInfo?.tenantDeveloperType === 'APPLICATION_ADMIN' ||
          appDetail?.appMember?.userId === userStore.getUserInfo.userId ||
          (platformType === PlatformEnum.PLATFORM_TENANT_CENTER &&
            userStore.getTenantUserInfo?.tenantManager === 1))
      ) {
        return true;
      }
      // 如果是eDHR应用，不需要显示设计按钮
      // if (['eDHR'].includes(info?.suiteKey)) {
      //   return false;
      // }
      return false;
    },
    style: {
      color: 'error',
    },
    tips: {
      row: t('sys.developer.appCenter.batchDetachTip'),
    },
  },
};

const dropBtnPropsMap = {
  /** 我创建的 - 设计、预览、锁定、解锁、详情、删除、 */
  [AppTabsMenuEnum.MineCreate]: [
    ButtonTypeEnum.Edit,
    ButtonTypeEnum.Design,
    ButtonTypeEnum.Preview,
    ButtonTypeEnum.Lock,
    ButtonTypeEnum.Unlock,
    ButtonTypeEnum.Detail,
    ButtonTypeEnum.Activate,
    ButtonTypeEnum.Delete,
  ],
  /** 我协作的 - 设计、预览、详情、 */
  [AppTabsMenuEnum.MineCollaborate]: [
    ButtonTypeEnum.Edit,
    ButtonTypeEnum.Design,
    ButtonTypeEnum.Preview,
    ButtonTypeEnum.Detail,
  ],
  /** 全部应用 - 设计、预览、锁定、解锁、详情、删除 */
  [AppTabsMenuEnum.AllApp]: [
    ButtonTypeEnum.Edit,
    ButtonTypeEnum.Design,
    ButtonTypeEnum.Preview,
    ButtonTypeEnum.Lock,
    ButtonTypeEnum.Unlock,
    ButtonTypeEnum.Detail,
    ButtonTypeEnum.Activate,
    ButtonTypeEnum.Delete,
  ],
  /** 回收站 - 预览、还原、清除 */
  [AppTabsMenuEnum.RecycleBin]: [ButtonTypeEnum.Preview, ButtonTypeEnum.Rest, ButtonTypeEnum.Clear],
  /** 成员列表 - 添加、移交、移除 */
  [AppDetailTabEnum.MemberList]: [
    ButtonTypeEnum.Add,
    ButtonTypeEnum.Transfer,
    ButtonTypeEnum.Detach,
  ],
};

/**
 * 获取卡片操作按钮
 * @param param0 tabType tab菜单类型
 */
export const getDropBtnPropsConfig = ({
  tabType,
}: {
  tabType: AppTabsMenuEnum | AppDetailTabEnum;
}) => {
  const actionBtnNames = dropBtnPropsMap[tabType];
  return actionBtnNames.map((key: string) => cloneDeep(buttonConfig[key]));
};
