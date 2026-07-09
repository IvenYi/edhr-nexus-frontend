<template>
  <div class="search-tab-designer">
    <EditableTabs v-model:active-key="activeKey" :tabs="widget.props.builtinTabs">
      <template v-if="widget.props.showButtonContainer" #rightExtra>
        <slot :parentWidget="widget" :children="[widget.children[2]]" :config="config"></slot>
      </template>
    </EditableTabs>
    <slot
      :parentWidget="widget"
      :children="[widget.children[0], widget.children[1]]"
      :config="config"
    ></slot>
  </div>
</template>

<script setup lang="ts" name="search-tab-designer">
  import { IVue3DndItemOptions } from '/@page-designer/designer/interface';
  import { EditableTabs } from '/@/components/EditableTabs';
  import { ISearchTab } from './schema';
  import { computed } from 'vue';

  const config: IVue3DndItemOptions = {
    direction: 'horizontal',
    isDrop: false,
    isDrag: false,
    isDelete: false,
    mode: 'move',
  };

  const props = defineProps<{
    widget: ISearchTab;
  }>();

  const activeKey = computed(() => props.widget.props.builtinTabs?.[0].id);
</script>

<style lang="less" scoped>
  .search-tab-designer {
    padding-bottom: 30px;
  }
</style>
