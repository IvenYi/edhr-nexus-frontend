import type { AppRouteModule } from '/@/router/types';
// import { PAAS_LAYOUT } from '/@/router/constant';
import PlatformMenuLayout from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/asset-center',
  name: 'AssetCenter',
  component: PlatformMenuLayout,
  redirect: '/asset-center/icon-pic',
  meta: {
    orderNo: 2,
    title: 'sys.menu.assetCenter',
    icon: 'iconfont:icon-zichanzhongxin',
  },
  children: [
    {
      path: 'icon-pic',
      name: 'AssetCenterIndex',
      component: () => import('/@developer-center/views/asset-center/index.vue'),
      meta: {
        title: 'sys.menu.iconAndPic',

        standbyHomePage: true,
      },
    },
    {
      path: 'custom-comp',
      name: 'CustomPageComp   ',
      component: () => import('/@developer-center/views/asset-center/custom-page-comp/index.vue'),
      meta: {
        title: 'sys.menu.customPageComp',
        standbyHomePage: true,
      },
    },
  ],
};

export default module;
