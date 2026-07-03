<template>
  <basic-page>
    <LoginLogList platform="APPDESIGN" :appId="appInfoStore?.appInfo?.id" />
  </basic-page>
</template>
<script setup lang="ts">
  import LoginLogList from '/@backend-management/views/operation-log/login-log/components/login-log-list.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();
</script>
<style lang="less" scoped></style>
