import type { AppRouteModule } from '/@/router/types';
import PlatformMenuLayout from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/learning-center',
  name: 'LearningCenter',
  component: PlatformMenuLayout,
  redirect: '/learning-center/index',
  meta: {
    orderNo: 4,
    title: 'sys.menu.learningCenter',
    icon: 'iconfont:icon-huanjingguanli',
    hideMenu: true,
  },
  children: [
    {
      path: 'index',
      name: 'LearningCenterIndex',
      component: () => import('/@developer-center/views/learning-center/index.vue'),
      meta: {
        title: 'sys.menu.learningCenter',
        hideMenu: true,
        currentActiveMenu: '/learning-center',
        standbyHomePage: true,
      },
    },
  ],
};

export default module;
