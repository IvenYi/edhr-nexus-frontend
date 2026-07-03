<template>
  <div class="login-history-container">
    <LoginLogList appId="" :createUserId="userStore.userInfo.userId" />
  </div>
</template>

<script setup lang="ts" name="login-history">
  import { useUserStore } from '/@/store/modules/user';
  import LoginLogList from '/@backend-management/views/operation-log/login-log/components/login-log-list.vue';

  const userStore = useUserStore();
</script>
<style lang="less" scoped></style>
