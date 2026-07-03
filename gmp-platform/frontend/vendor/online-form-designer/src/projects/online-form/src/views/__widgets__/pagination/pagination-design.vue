<template>
  <div class="w-full h-full flex" :style="style">{{ pagination }}</div>
</template>

<script setup lang="ts">
  import { PaginationFormat } from '@gct/nocode-base';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { calcText } from './utils';
  import { computed } from 'vue';

  const props = defineProps<{
    widget: PaperWidget.Pagination;
  }>();

  const pagination = computed(() => {
    const { format, customFormat } = props.widget;
    if (format === PaginationFormat.Custom && !customFormat)
      return $t('sys.onlineForm.pleaseConfigurePageNumberStyle');
    return calcText(format === PaginationFormat.Custom ? customFormat : format, {
      no: 1,
      total: 1,
    });
  });

  const style = computed(() => {
    const styles = props.widget.styles;
    return {
      ...styles,
      fontSize: styles.fontSize + 'px',
    };
  });
</script>

<style></style>
