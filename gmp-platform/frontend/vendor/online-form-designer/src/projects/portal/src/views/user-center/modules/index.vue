<template>
  <basic-page>
    <platform-detail-comp :menus="menus" :active-menu="activeMenu" :comp="true">
      <slot>
        <component :is="currentComp" />
      </slot>
    </platform-detail-comp>
  </basic-page>
</template>

<script lang="ts" setup>
  import { computed, defineAsyncComponent } from 'vue';
  import PlatformDetailComp from '/@/layouts/platform/platform-detail-comp.vue';
  import { ProjectName } from '/@/enums/appEnum';
  import { UserCenterSubMenus } from '/@portal/router/routes/constants';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useRoute } from 'vue-router';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { useEnv } from '/@/hooks/develop/useEnv';

  import { useAppInfoStore } from '/@/store/modules/app-info';

  const route = useRoute();

  const userStore = useUserStoreWithOut();

  const { getCurrentProject } = usePermissionStoreWithOut();

  const { isSandbox } = useEnv();

  const menusTransfer = UserCenterSubMenus.map((item) => {
    return {
      ...item,
      component: defineAsyncComponent(item.component as any),
    };
  });
  const appInfoStore = useAppInfoStore();
  const isInEDHR = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const menus = computed(() => {
    let menulist = UserCenterSubMenus;
    if (userStore.getUserInfo?.globalSuperAdmin) {
      menulist = menulist.filter((i) => i.name !== 'UserCenterMy');
    }
    // 沙箱环境不显示个人信息和修改密码
    if (isSandbox) {
      let range = ['login-history', 'web-workbench'];
      return menulist.filter((i) => range.includes(i.path));
    }
    // 门户显示所有
    if (getCurrentProject === ProjectName.PORTAL) {
      return menulist;
    } else {
      // 非门户只显示这三个
      let range = ['my', 'password', 'login-history'];
      if (getCurrentProject === ProjectName.WEB_RENDER) {
        range.push('web-workbench');
      }
      if (isInEDHR.value) {
        // edhr应用
        range.push('mobile');
      }
      return menulist.filter((i) => range.includes(i.path));
    }
  });
  const activeMenu = computed(() => {
    return route.path.split('/').pop();
  });

  const currentComp = computed(() => {
    return menusTransfer.find((i) => i.path === activeMenu.value)?.component;
  });
</script>
<style lang="less"></style>
