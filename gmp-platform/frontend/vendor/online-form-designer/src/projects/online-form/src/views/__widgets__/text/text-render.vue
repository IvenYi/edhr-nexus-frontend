<template>
  <div class="text-wrapper" :style="wrapperStyle">
    <div class="w-full h-full flex ws-pre-wrap" :style="style" :title="widget.value">{{
      modelValue
    }}</div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  const props = defineProps<{
    widget: PaperWidget.Text;
    modelValue: any;
  }>();

  const { styles, layout } = reactive(props.widget);

  const style = computed(() => {
    return {
      ...styles,
      fontSize: styles.fontSize + 'px',
    };
  });

  const wrapperStyle = computed(() => {
    return Object.entries(layout)
      .map(([key, value]) => `${key}: ${value}px;`)
      .join(' ');
  });
</script>

<style scoped>
  .text-wrapper {
    position: absolute;
  }
</style>
