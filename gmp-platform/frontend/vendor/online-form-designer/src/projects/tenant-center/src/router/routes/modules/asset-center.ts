import type { AppRouteModule } from '/@/router/types';
// import { PAAS_LAYOUT } from '/@/router/constant';
import PlatformMenuLayout from '/@/layouts/platform/platform-menu-layout.vue';
import { CustomAction, BasicAction, DefaultActions } from '/@/enums/authActionEnum';

const module: AppRouteModule = {
  path: '/asset-center',
  name: 'AssetCenter',
  component: PlatformMenuLayout,
  redirect: '/asset-center/resource',
  meta: {
    orderNo: 4,
    title: 'sys.menu.assetCenter',
    icon: 'iconfont:icon-zichanzhongxin',
  },
  children: [
    {
      path: 'resource',
      name: 'DevelopResourceManagement',
      component: () => import('/@tenant-center/views/asset-center/resource/index.vue'),
      meta: {
        title: 'sys.menu.iconAndPic',
        hideChildrenInMenu: true,
        standbyHomePage: true,
      },
      children: [
        {
          path: 'icon',
          name: 'DevelopIconManagement',
          meta: {
            title: 'sys.menu.iconManagement',
            authActions: [...DefaultActions, CustomAction.CategoryManagement],
          },
        },
        {
          path: 'image',
          name: 'DevelopImageManagement',
          meta: {
            title: 'sys.menu.imageManagement',
            authActions: [...DefaultActions, CustomAction.CategoryManagement],
          },
        },
      ],
    },
    {
      path: 'seal-management',
      name: 'SealManagement',
      component: () => import('/@tenant-center/views/asset-center/seal-management/index.vue'),
      meta: {
        title: 'sys.menu.sealManagement',
        authActions: [
          BasicAction.Insert,
          BasicAction.Update,
          CustomAction.ChangeSealPassword,
          BasicAction.Delete,
        ],
        standbyHomePage: true,
      },
    },
  ],
};

export default module;
