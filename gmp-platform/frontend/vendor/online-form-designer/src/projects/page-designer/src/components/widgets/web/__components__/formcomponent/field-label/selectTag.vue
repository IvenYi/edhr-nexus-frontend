<template>
  <taglabel :tagWidgetStyle="tagWidgetStyle" />
</template>

<script setup lang="ts">
  import taglabel from './taglabel.vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { toRef } from 'vue';

  export interface Props {
    tagWidgetStyle: {
      tagStyleOpen: boolean;
      contentFont: LowCodeWidget.FontStyle;
      tagStyle?: LowCodeWidget.TagConfigStyle;
    };
  }
  const props = defineProps<Props>();
  const tagWidgetStyle = toRef(() => {
    if (!props.tagWidgetStyle.tagStyleOpen) {
      return {
        tagStyleOpen: true,
        contentFont: props.tagWidgetStyle?.contentFont,
      };
    } else {
      return props.tagWidgetStyle;
    }
  });
</script>
<style scoped lang="less"></style>
