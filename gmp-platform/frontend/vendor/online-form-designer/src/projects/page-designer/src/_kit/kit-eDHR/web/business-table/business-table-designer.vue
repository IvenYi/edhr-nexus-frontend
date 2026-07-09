<template>
  <div class="business-table-designer">
    <slot
      v-if="widget.children.length > 0"
      :parentWidget="widget"
      :children="widget.children"
      :config="NoDragableConfig"
    ></slot>
    <slot v-else :parentWidget="widget" :children="widget.children" :config="DragableConfig"></slot>
  </div>
</template>

<script setup lang="ts" name="business-table-designer">
  import { IVue3DndItemOptions } from '/@page-designer/designer/interface';
  import { IBusinessTable } from './schema';

  const props = defineProps<{
    widget: IBusinessTable;
  }>();

  const DragableConfig: IVue3DndItemOptions = {
    direction: 'horizontal',
    isDrop: true,
    isDrag: true,
    isDelete: true,
    mode: 'move',
  };

  const NoDragableConfig: IVue3DndItemOptions = {
    direction: 'horizontal',
    isDrop: false,
    isDrag: true,
    isDelete: true,
    mode: 'move',
  };
</script>

<style lang="less" scoped>
  .business-table-designer {
    padding-bottom: 30px;
  }
</style>
