<template>
  <van-col :span="widget.props.span">
    <div class="h100%" :style="styleProps">
      <slot></slot>
    </div>
  </van-col>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { GridCol } from '/@page-designer/types/mobile';

  const props = defineProps<{ widget: GridCol }>();

  const styleProps = computed(() => {
    const style = props.widget.style;
    return {
      backgroundColor: style.backgroundColor,
      paddingTop: `${style.paddingTop}px`,
      paddingBottom: `${style.paddingBottom}px`,
      paddingLeft: `${style.paddingLeft}px`,
      paddingRight: `${style.paddingRight}px`,
      borderLeft: `${style.borderLeft?.borderWidth}px ${style.borderLeft?.borderStyle} ${style.borderLeft?.borderColor}`,
      borderRight: `${style.borderRight?.borderWidth}px ${style.borderRight?.borderStyle} ${style.borderRight?.borderColor}`,
      borderTop: `${style.borderTop?.borderWidth}px ${style.borderTop?.borderStyle} ${style.borderTop?.borderColor}`,
      borderBottom: `${style.borderBottom?.borderWidth}px ${style.borderBottom?.borderStyle} ${style.borderBottom?.borderColor}`,
    };
  });
</script>

<style lang="less" scoped>
  .grid-col {
    box-sizing: border-box;
  }
</style>
