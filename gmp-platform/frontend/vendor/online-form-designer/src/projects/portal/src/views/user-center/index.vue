<template> <PlatformHeaderDetailLayout :menus="menus" /></template>

<script setup lang="ts">
  import PlatformHeaderDetailLayout from '/@/layouts/platform/platform-detail-layout.vue';
  import { UserCenterSubMenus } from '/@portal/router/routes/constants';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { computed } from 'vue';
  import { useUserStoreWithOut } from '/@/store/modules/user';

  const userStore = useUserStoreWithOut();

  const { getCurrentProject } = usePermissionStoreWithOut();

  const menus = computed(() => {
    const range = ['my', 'password', 'login-history'];
    let menulist = UserCenterSubMenus;
    if (userStore.getUserInfo?.globalSuperAdmin) {
      menulist = menulist.filter((i) => i.name !== 'UserCenterMy');
    }
    return getCurrentProject === ProjectName.PORTAL
      ? menulist
      : menulist.filter((i) => range.includes(i.path));
  });
</script>

<style lang="less" scoped></style>
