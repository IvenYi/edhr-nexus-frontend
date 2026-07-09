<template>
  <div style="width: 100%" class="vxetable">
    <vxeDesignTable
      isTree
      :serialNumber="serialNumber"
      :datasource="datasource"
      :columns="widget.children"
      :rowdraggable="rowdraggable"
      :tableWidget="widget"
      v-if="widget.children.length"
      :tree-config="{
        transform: true,
        rowField: 'id_',
        parentField: 'parent_id_',
        expandAll: true,
      }"
      :height="height"
      :rowSelectionType="rowSelectionType"
      :rowSelection="!!rowSelection"
    >
      <template #tree-remark="{ treeNode, params, row }">
        <span v-if="treeNode">{{ row.remark_no }}</span>
        <span v-else-if="params.props.field === 'parent_id_' && row.parent_id_">{{
          `(${row.parent_id_})`
        }}</span>
      </template>
    </vxeDesignTable>
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

<script setup lang="ts" name="gct-tree-table">
  import { computed, toRefs, toRef } from 'vue';

  import { TreeTableMobile } from '/@page-designer/types/web';
  import { tableColumnWidthEnum } from '/@page-designer/enum';
  import vxeDesignTable from '../data-table/component/vxeDesignTable/index.vue';

  const props = defineProps<{ widget: TreeTableMobile }>();
  const { model, rowdraggable, serialNumber } = toRefs(props.widget.props);

  // 是否开启数据选择
  const rowSelection = computed(() => {
    return props.widget.props.rowSelection;
  });
  // 数据选择模式
  const rowSelectionType = computed(() => {
    return props.widget.props.rowSelectionType;
  });

  const { tableheight, tableheightConfigure } = toRefs(props.widget.style);
  const height = toRef(() => {
    if (tableheightConfigure?.value === tableColumnWidthEnum.ENUMERATION) {
      return tableheight.value;
    }
  });

  const datasource = computed(() => {
    const firstField = props.widget.children?.[0];
    const obj =
      firstField.props.field !== 'parent_id_'
        ? { tree_first_field_type: firstField?.props?.fieldType }
        : {};

    return [
      { id_: 1, parent_id_: null, remark_no: '(1)', ...obj },
      { id_: 2, parent_id_: 1, remark_no: '(1.1)', ...obj },
      { id_: 3, parent_id_: null, remark_no: '(2)', ...obj },
    ];
  });
</script>
<style lang="less">
  .active {
    background-color: var(--vxe-table-column-hover-background-color);
  }

  // .vxetable {
  //   --vxe-table-column-hover-background-color: red;
  // }
</style>
