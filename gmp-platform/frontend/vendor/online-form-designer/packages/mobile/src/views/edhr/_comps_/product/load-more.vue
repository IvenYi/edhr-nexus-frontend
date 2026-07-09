<template>
  <div ref="target"> <a-spin size="small" /></div>
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
<style scoped lang="less"></style>
