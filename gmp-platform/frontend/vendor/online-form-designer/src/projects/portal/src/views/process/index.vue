<template> <PlatformHeaderDetailLayout :menus="ProcessCenterSubMenus" /></template>

<script setup lang="ts">
  import PlatformHeaderDetailLayout from '/@/layouts/platform/platform-detail-layout.vue';
  import { ProcessCenterSubMenus } from '/@portal/router/routes/constants';
</script>

<style lang="less" scoped></style>
