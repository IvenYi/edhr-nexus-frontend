import type { AppRouteModule } from '/@/router/types';
// import { PAAS_LAYOUT as LAYOUT } from '/@/router/constant';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';
import { DefaultActions, BasicAction, PlatformSettingActions } from '/@/enums/authActionEnum';

const dashboard: AppRouteModule = {
  path: '/platform',
  name: 'Platform',
  component: LAYOUT,
  redirect: '/platform/setting',
  meta: {
    orderNo: 3,
    title: 'sys.menu.platformManagement',
    icon: 'iconfont:icon-menhuguanli',
    skipAuthAccess: true,
  },
  children: [
    {
      path: 'setting',
      name: 'PlatformSetting',
      component: () =>
        import('/@backend-management/views/platform/platform-setting/platform-setting.vue'),
      meta: {
        title: 'sys.menu.platformSetting',
        authActions: PlatformSettingActions,
        standbyHomePage: true,
      },
    },
    {
      path: 'language',
      name: 'PlatformLanguage',
      component: () => import('/@backend-management/views/i18n/locale-manager/locale.vue'),
      meta: {
        title: 'sys.menu.languageManagement',
        authActions: DefaultActions,
        standbyHomePage: true,
      },
    },

    {
      path: 'i18n',
      name: 'PlatformI18n',
      component: () => import('/@backend-management/views/i18n/translate-manager/i18n.vue'),
      meta: {
        title: 'sys.menu.i18nManagement',
        authActions: [...DefaultActions, BasicAction.Import, BasicAction.Export],
        standbyHomePage: true,
      },
    },
    {
      path: 'activate',
      name: 'PlatformActivate',
      component: () => import('/@backend-management/views/platform/activate/platform-activate.vue'),
      meta: {
        title: 'sys.menu.platformActivate',
        authActions: [BasicAction.Add],
        standbyHomePage: true,
      },
    },
    // {
    //   path: 'authorization',
    //   name: 'PlatformAuthorization',
    //   // component: () => import('/@backend-management/views/i18n/locale-manager/locale.vue'),
    //   meta: {
    //     title: 'sys.menu.platformAuthorization',
    //     standbyHomePage: true,
    //   },
    // },
    // {
    //   path: 'product',
    //   name: 'PlatformProduct',
    //   // component: () => import('/@backend-management/views/i18n/locale-manager/locale.vue'),
    //   meta: {
    //     title: 'sys.menu.productManagement',
    //     standbyHomePage: true,
    //   },
    // },
  ],
};

export default dashboard;
