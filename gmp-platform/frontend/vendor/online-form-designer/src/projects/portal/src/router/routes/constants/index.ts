export const UserCenterSubMenus = [
  {
    path: 'my',
    name: 'UserCenterMy',
    component: () => import('/@portal/views/user-center/modules/my.vue'),
    meta: {
      title: 'sys.menu.personalInfo',
    },
  },
  {
    path: 'password',
    name: 'UserCenterPassword',
    component: () => import('/@portal/views/user-center/modules/password.vue'),
    meta: {
      title: 'sys.menu.changePassword',
    },
  },
  {
    path: 'login-history',
    name: 'UserCenterLoginHistory',
    component: () => import('/@portal/views/user-center/modules/login-history.vue'),
    meta: {
      title: 'sys.menu.loginHistory',
    },
  },
  {
    path: 'web-workbench',
    name: 'UserCenterWebWorkbench',
    component: () => import('/@portal/views/user-center/modules/web-workbench.vue'),
    meta: {
      title: 'sys.menu.webWorkbench',
    },
  },
  // {
  //   path: 'mobile-workbench',
  //   name: 'UserCenterMobileWorkbench',
  //   component: () => import('/@portal/views/user-center/modules/mobile-workbench.vue'),
  //   meta: {
  //     title: 'sys.menu.mobileWorkbench',
  //   },
  // },
  {
    path: 'mobile',
    name: 'UserCenterMobile',
    component: () => import('/@portal/views/user-center/modules/mobile.vue'),
    meta: {
      title: 'sys.menu.mobileConfig',
    },
  },
];

export const ProcessCenterSubMenus = [
  {
    path: 'todo',
    name: 'ProcessCenterTodo',
    component: () => import('/@portal/views/process/modules/todo.vue'),
    meta: {
      title: 'sys.menu.myTodo',
    },
  },
  {
    path: 'application',
    name: 'ProcessCenterApplication',
    component: () => import('/@portal/views/process/modules/application.vue'),
    meta: {
      title: 'sys.menu.myApplication',
    },
  },
  {
    path: 'done',
    name: 'ProcessCenterDone',
    component: () => import('/@portal/views/process/modules/done.vue'),
    meta: {
      title: 'sys.menu.myDone',
    },
  },
  {
    path: 'delegation',
    name: 'ProcessCenterDelegation',
    component: () => import('/@portal/views/process/modules/delegation.vue'),
    meta: {
      title: 'sys.menu.delegation',
    },
  },
];

export const MessageCenterSubMenus = [
  {
    path: 'unread',
    name: 'unReadMessage',
    component: () => import('/@portal/views/message/unread.vue'),
    meta: {
      title: 'sys.menu.unReadMessage',
    },
  },
  {
    path: 'all',
    name: 'AllMessage',
    component: () => import('/@portal/views/message/all.vue'),
    meta: {
      title: 'sys.menu.allMessage',
    },
  },
];
