<template>
  <div class="load-more">
    <van-loading type="spinner" />
    <div ref="target"></div>
  </div>
</template>

<script setup lang="ts" name="load-more">
  import { useIntersectionObserver } from '@vueuse/core';
  import { ref, onUnmounted } from 'vue';

  const target = ref(null);
  const emit = defineEmits(['more']);
  const targetIsVisible = useIntersectionObserver(target, ([{ isIntersecting }]) => {
    if (isIntersecting) {
      emit('more');
    }
  });
  onUnmounted(() => {
    targetIsVisible.stop();
  });
</script>
<style scoped lang="less">
  .load-more {
    text-align: center;
    padding: 10px 0;
  }
</style>
