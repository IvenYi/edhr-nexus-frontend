<template>
  <a-layout class="bi-paas-portal-layout">
    <bi-platform-header class="flex-none" />
    <div class="text-24px font-bold mx-20px mt-16px">BI看板</div>
    <a-layout-content class="bi-paas-content">
      <bi-app-center-wrapper />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
  import BiPlatformHeader from '/@/layouts/platform/bi-platform-header.vue';
  import BiAppCenterWrapper from '/@/projects/developer-center/src/views/app-center/components/bi-app-center-wrapper.vue';
</script>

<style lang="less" scoped>
  .bi-paas-portal-layout {
    height: 100%;
    min-height: 100%;
    overflow: hidden;
    .bi-paas-content {
      position: relative;
      flex: 1 1 auto;
      overflow: auto;
      padding: 16px 0;
      background-color: #eff3f9;
    }
  }
</style>
