<template>
  <a-col :span="widget!.props.span">
    <div class="grid-col" :style="wrapperStyle">
      <slot></slot>
    </div>
  </a-col>
</template>

<script setup lang="ts">
  import { widgetWrapperProps } from '/@page-designer/hooks/useWidget';
  import { useStyle } from '/@page-designer/hooks/useStyle';

  const props = defineProps(widgetWrapperProps);
  const { wrapperStyle } = useStyle(props.widget);
</script>

<style lang="less" scoped>
  .grid-col {
    box-sizing: border-box;
  }
</style>
