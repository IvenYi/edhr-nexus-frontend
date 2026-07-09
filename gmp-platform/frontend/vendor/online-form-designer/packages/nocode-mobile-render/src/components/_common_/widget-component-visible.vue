<!-- 组件是否显示 -->
<template>
  <div :class="['cell-wrapper', otherClass]">
    <slot></slot>
  </div>
</template>

<script setup lang="ts" name="WidgetComponentVisible">
  import { useStyles, type BaseCoreComponent } from '@gct/nocode-base';

  const props = defineProps<{
    widget: BaseCoreComponent.BasicSchema;
  }>();

  const { otherClass } = useStyles(props.widget);
</script>
<style scoped lang="less">
  .cell-wrapper {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    left: 0;
    top: 0;
  }
</style>
