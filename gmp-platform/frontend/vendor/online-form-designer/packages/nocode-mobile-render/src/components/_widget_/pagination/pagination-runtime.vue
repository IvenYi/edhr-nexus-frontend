<template>
  <div class="pagination-wrapper" :style="wrapperStyle" :data-format="formatValue">
    <div class="w-full h-full flex" :style="style">{{ pagination }}</div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { PaginationFormat } from '@gct/nocode-base';
  import { calcText } from './utils';

  const props = defineProps<{
    widget: any;
    pageNumber: number;
    pageTotal: number;
  }>();

  const formatValue = computed(() => {
    const { format, customFormat } = props.widget;
    return format === PaginationFormat.Custom ? customFormat : format;
  });

  const pagination = computed(() => {
    return calcText(formatValue.value, {
      no: props.pageNumber,
      total: props.pageTotal,
    });
  });

  const wrapperStyle = computed(() => {
    return Object.entries(props.widget.layout)
      .map(([key, value]) => `${key}: ${value}px;`)
      .join(' ');
  });

  const style = computed(() => {
    const styles = props.widget.styles;
    return {
      ...styles,
      fontSize: styles.fontSize + 'px',
    };
  });
</script>

<style scoped>
  .pagination-wrapper {
    position: absolute;
  }
</style>
