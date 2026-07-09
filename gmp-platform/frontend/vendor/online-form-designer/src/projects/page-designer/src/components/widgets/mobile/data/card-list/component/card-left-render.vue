<template>
  <van-form input-align="left" required="auto" style="height: 100%">
    <slot></slot>
  </van-form>
</template>
<script setup lang="ts">
  import { provide } from 'vue';

  provide('form-layout', { inputAlign: 'left' });
</script>
<style lang="less" scoped></style>
