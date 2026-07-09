<template>
  <a-layout :class="prefixCls">
    <a-layout-content :class="`${prefixCls}__content`">
      <RouterView />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
  const prefixCls = 'form-template-layout';
</script>

<style lang="less" scoped>
  @prefix-cls: ~'form-template-layout';

  .@{prefix-cls} {
    height: 100vh;
    overflow: hidden;
    background: #eff3f9;

    &__content {
      height: 100%;
      min-height: 0;
      padding: 16px;
    }
  }
</style>
