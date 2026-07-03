<template>
  <a-layout :class="prefixCls">
    <platform-header class="flex-none" />
    <a-layout-content :class="`${prefixCls}__content`">
      <div :class="`${prefixCls}__route`">
        <RouterView />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
  import PlatformHeader from './platform-header.vue';

  const prefixCls = 'platform-header-layout';
</script>

<style lang="less" scoped>
  @prefix-cls: ~'platform-header-layout';

  .@{prefix-cls} {
    height: 100vh;
    overflow: hidden;

    &__content {
      background-color: #eff3f9;
      position: relative;
      flex: 1 1 auto;
      padding: 24px;
    }
    &__route {
      margin: 0 auto;
      max-width: 1200px;
      height: 100%;
      background: #fff;
    }
  }
</style>
