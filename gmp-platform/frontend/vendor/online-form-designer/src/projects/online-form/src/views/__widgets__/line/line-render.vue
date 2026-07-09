<template>
  <LineDesign v-bind="$props" :style="wrapperStyle" class="absolute" />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { pick } from 'lodash-es';
  import LineDesign from './line-design.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  const props = defineProps<{
    widget: PaperWidget.Line;
    isInCell?: boolean;
  }>();

  const wrapperStyle = computed(() => {
    if (props.isInCell) return {};
    const obj = pick(props.widget.layout, ['width', 'height']);
    for (const [key, value] of Object.entries(props.widget.layout)) {
      obj[key] = `${value}px`;
    }
    return obj;
  });
</script>

<style></style>
