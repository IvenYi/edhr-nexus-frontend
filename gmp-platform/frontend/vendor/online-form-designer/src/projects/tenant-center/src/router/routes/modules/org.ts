import type { AppRouteModule } from '/@/router/types';
import { getParentLayout } from '/@/router/constant';
import LAYOUT from '/@/layouts/platform/platform-menu-layout.vue';
import { CustomAction, DefaultActions, BasicAction } from '/@/enums/authActionEnum';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';

const { getOrgDelUser } = useRootSetting();

const dashboard: AppRouteModule = {
  path: '/org',
  name: 'Org',
  component: LAYOUT,
  redirect: '/org/user',
  meta: {
    orderNo: 1,
    title: 'sys.menu.orgPermission',
    icon: 'iconfont:icon-zuzhiquanxian',
    skipAuthAccess: true,
  },
  children: [
    {
      path: 'user',
      name: 'OrgUser',
      component: () => import('/@tenant-center/views/org/user-manage/index.vue'),
      meta: {
        title: 'sys.menu.userManagement',
        authActions: getOrgDelUser.value
          ? [
              BasicAction.Insert,
              BasicAction.Update,
              BasicAction.Import,
              BasicAction.Export,
              CustomAction.ResetPassword,
              CustomAction.EnableDisable,
              CustomAction.ResetSignPassword,
              BasicAction.Delete,
            ]
          : [
              // ...DefaultActions,
              BasicAction.Insert,
              BasicAction.Update,
              BasicAction.Import,
              BasicAction.Export,
              CustomAction.ResetPassword,
              CustomAction.EnableDisable,
              CustomAction.ResetSignPassword,
            ],
        filterAction: () => {
          return getOrgDelUser.value
            ? [
                BasicAction.Insert,
                BasicAction.Update,
                BasicAction.Import,
                BasicAction.Export,
                CustomAction.ResetPassword,
                CustomAction.EnableDisable,
                CustomAction.ResetSignPassword,
                BasicAction.Delete,
              ]
            : [
                // ...DefaultActions,
                BasicAction.Insert,
                BasicAction.Update,
                BasicAction.Import,
                BasicAction.Export,
                CustomAction.ResetPassword,
                CustomAction.EnableDisable,
                CustomAction.ResetSignPassword,
              ];
        },
        standbyHomePage: true,
      },
    },
    {
      path: 'member',
      name: 'OrgMember',
      component: () => import('/@tenant-center/views/org/org-member/index.vue'),
      meta: {
        title: 'sys.menu.orgMember',
        authActions: [
          // ...DefaultActions,
          BasicAction.Insert,
          BasicAction.Update,
          BasicAction.Import,
          BasicAction.Export,
          CustomAction.Moving,
        ],
        standbyHomePage: true,
      },
    },
    {
      path: 'permission',
      name: 'OrgPermission',
      component: getParentLayout('OrgPermission'),
      meta: {
        title: 'sys.menu.permissionManagement',
        hideChildrenInMenu: true,
      },
      redirect: '/org/permission/role',
      children: [
        {
          path: 'role',
          name: 'OrgPermissionRole',
          component: () => import('/@/views/permission/role-management.vue'),
          meta: {
            title: 'sys.menu.roleManagement',
            currentActiveMenu: '/org/permission',
            authActions: [...DefaultActions, CustomAction.PermissionSetting],
            standbyHomePage: true,
          },
        },
        {
          path: 'role-setting/:roleId',
          name: 'OrgPermissionRoleSetting',
          component: () => import('/@/views/permission/role-setting.vue'),
          meta: {
            title: 'sys.menu.rolePermissionSetting',
            currentActiveMenu: '/org/permission',
            hideMenuInAuth: true,
            standbyAuthName: `OrgPermissionRole.${CustomAction.PermissionSetting}`,
          },
        },
        {
          path: 'administrator',
          name: 'OrgPermissionAdmin',
          component: () => import('/@/views/permission/administrator.vue'),
          meta: {
            title: 'sys.menu.administrator',
            currentActiveMenu: '/org/permission',
            authActions: DefaultActions,
            standbyHomePage: true,
          },
        },
      ],
    },
    {
      path: 'seat',
      name: 'OrgSeat',
      component: () => import('/@tenant-center/views/org/org-seat/index.vue'),
      meta: {
        title: 'sys.menu.seatManagement',
        authActions: [BasicAction.Insert, BasicAction.Delete],
        standbyHomePage: true,
      },
    },
  ],
};

export default dashboard;
