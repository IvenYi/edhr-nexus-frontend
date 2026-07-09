<template>
  <login-layout>
    <login-form />
  </login-layout>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import LoginLayout from './login-layout.vue';
  import LoginForm from './components/login-form.vue';
  import { OnlineControl } from '/@/utils/onlineControl';

  onMounted(() => {
    OnlineControl.closeControl();
  });
  onUnmounted(() => {
    OnlineControl.runListener();
  });
</script>

<style lang="less" scoped></style>
