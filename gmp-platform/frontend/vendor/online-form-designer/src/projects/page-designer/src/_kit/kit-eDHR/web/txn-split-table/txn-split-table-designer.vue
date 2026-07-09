<template>
  <div class="txn-split-table-designer">
    <slot
      :parentWidget="widget"
      :children="computedChild"
      :config="{
        direction: 'horizontal',
        isDrop: true,
        isDrag: true,
        isDelete: true,
        mode: 'move',
      }"
    ></slot>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { ITxnSplitTable } from './schema';

  const props = defineProps<{
    widget: ITxnSplitTable;
  }>();

  const computedChild = computed(() => {
    return props.widget.children || [];
  });
</script>

<style lang="less" scoped></style>
