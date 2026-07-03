import type { AppRouteModule } from '/@/router/types';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/app-develop',
  name: 'AppDevelop',
  component: LAYOUT,
  redirect: '/app-develop/logic-develop',
  meta: {
    orderNo: 2,
    title: 'sys.menu.appDevelop',
    icon: 'iconfont:icon-yingyongkaifa',
  },
  children: [
    {
      path: 'logic-develop',
      name: 'LogicDevelop',
      component: () => import('/@app-designer/views/logic-develop/logic-develop.vue'),
      meta: {
        title: 'sys.menu.logicDevelop',
      },
    },
    {
      path: 'timed-task',
      name: 'TimedTask',
      component: () => import('/@app-designer/views/timed-task/timed-task'),
      meta: {
        title: 'sys.menu.timedTask',
      },
    },
    {
      path: 'message-template',
      name: 'MessageTemplate',
      component: () => import('/@app-designer/views/message-center/message-template.vue'),
      meta: {
        title: 'sys.menu.MessageTemplate',
      },
    },
    {
      path: 'i18-manager',
      name: 'I18Manager',
      component: () => import('/@app-designer/views/i18-manager/i18-manager.vue'),
      meta: {
        title: 'sys.menu.i18nSetting',
      },
    },
    {
      path: 'global-events',
      name: 'GlobalEvents',
      component: () => import('/@app-designer/views/global-events/global-events.vue'),
      meta: {
        title: 'sys.menu.globalEvents',
      },
    },
    {
      path: 'system-variables',
      name: 'SystemVariables',
      component: () => import('/@app-designer/views/system-variables/system-variables.vue'),
      meta: {
        title: 'sys.menu.systemVariables',
      },
    },
  ],
};

export default module;
