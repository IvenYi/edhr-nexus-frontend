<template>
  <div class="user-page">
    <van-nav-bar class="flex-none" left-arrow @click-left="onClickLeft" />
    <div class="flex-1 overflow-hidden">
      <user-comp :hide-tenant-toggle="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import UserComp from './user/index.vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const onClickLeft = () => {
    router.back();
  };
</script>
<style scoped lang="less">
  .user-page {
    height: 100%;
    background: linear-gradient(180deg, #e0ecff 0%, #f4f7ff 58%), #f4f7ff;
  }
</style>
