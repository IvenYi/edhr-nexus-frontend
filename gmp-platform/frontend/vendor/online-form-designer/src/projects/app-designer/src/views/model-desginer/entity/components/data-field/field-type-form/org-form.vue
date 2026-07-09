<template> <Org ref="orgRef" /> </template>

<script setup lang="ts" name="org">
  import { ref } from 'vue';
  import Org from './org-multi-form.vue';

  const orgRef = ref();

  const _initData = () => {
    return orgRef.value?.initData();
  };

  defineExpose({
    initData: _initData,
  });
</script>

<style lang="less" scoped></style>
