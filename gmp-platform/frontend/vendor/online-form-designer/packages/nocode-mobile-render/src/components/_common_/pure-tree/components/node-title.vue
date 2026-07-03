<template>
  <span :class="['node-title']" :title="tooltip">{{ title }} </span>
</template>

<script lang="ts" setup name="node-title">
  const props = withDefaults(
    defineProps<{
      title: string;
      tooltip?: string;
    }>(),
    {},
  );
</script>

<style lang="less" scoped>
  .node-title {
    padding-left: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    line-height: 24px;
  }
</style>
