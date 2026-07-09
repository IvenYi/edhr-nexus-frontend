<template>
  <div ref="target"> <a-spin size="small" /></div>
</template>

<script setup lang="ts">
  import { useIntersectionObserver } from '@vueuse/core';
  import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue';
  const target = ref(null);
  const emit = defineEmits(['next']);
  const targetIsVisible = useIntersectionObserver(
    target,
    ([{ isIntersecting }], observerElement) => {
      if (isIntersecting) {
        emit('next');
      }
    },
  );
  onUnmounted(() => {
    targetIsVisible.stop();
  });
</script>
<style scoped lang="less"></style>
