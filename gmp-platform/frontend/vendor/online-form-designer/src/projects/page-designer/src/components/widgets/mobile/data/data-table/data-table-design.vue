<template>
  <div style="width: 100%" class="vxetable">
    <vxeDesignTable
      :serialNumber="serialNumber"
      :datasource="datasource"
      :columns="widget.children"
      :rowdraggable="rowdraggable"
      :tableWidget="widget"
      :rowSelection="!!rowSelection"
      :rowSelectionType="rowSelectionType"
      v-if="widget.children.length"
    />
    <div class="p10px h100px ks-row-center-middle bg-[#FCFCFD] gct-border-dashed" v-else-if="model">
      <span class="text-[#C3C3C3] text-14px"> {{ $t('sys.pageDesigner.selectModelFields') }}</span>
    </div>
    <div class="p10px h100px ks-row-center-middle bg-[#FCFCFD] gct-border-dashed" v-else>
      <span class="text-[#C3C3C3] text-14px">
        {{ $t('sys.pageDesigner.selectAssociatedModel') }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-data-table">
  import { computed, toRefs, toRef } from 'vue';

  import { DataTable } from '/@page-designer/types/web';

  import vxeDesignTable from './component/vxeDesignTable/index.vue';

  const props = defineProps<{ widget: DataTable }>();
  const { model, rowdraggable, serialNumber } = toRefs(props.widget.props);

  // 是否开启数据选择
  const rowSelection = computed(() => {
    return props.widget.props.rowSelection;
  });
  // 数据选择模式
  const rowSelectionType = computed(() => {
    return props.widget.props.rowSelectionType;
  });

  const datasource = [{ index: 1 }];
</script>
<style lang="less">
  .active {
    background-color: var(--vxe-table-column-hover-background-color);
  }
  .vxe-table--render-default .vxe-cell {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  // .vxetable {
  //   --vxe-table-column-hover-background-color: red;
  // }
</style>
