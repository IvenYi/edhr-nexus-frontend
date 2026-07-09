<template> <User ref="userRef" :isMultiple="false" /> </template>

<script setup lang="ts" name="user">
  import { ref } from 'vue';
  import User from './user-multi-form.vue';

  const userRef = ref();

  const _initData = () => {
    return userRef.value?.initData();
  };

  defineExpose({
    initData: _initData,
  });
</script>

<style lang="less" scoped></style>
