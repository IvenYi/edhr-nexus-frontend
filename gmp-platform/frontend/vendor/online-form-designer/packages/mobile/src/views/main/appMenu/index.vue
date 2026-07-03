<template>
  <div class="h100vh pb60px overflow-auto">
    <Menu />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import Menu from '../../myApp/index.vue';
  import { useAppStore } from '@mobile/stores/useAppStore';
  const appStore = useAppStore();
</script>
<style scoped lang="less"></style>
