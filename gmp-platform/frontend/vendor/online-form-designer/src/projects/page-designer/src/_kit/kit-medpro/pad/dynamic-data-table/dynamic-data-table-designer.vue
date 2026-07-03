<template>
  <div class="data-collection-table">
    <vxe-grid
      class="vxetable"
      round
      :row-config="{ isHover: true, useKey: true, keyField: 'id', isCurrent: true }"
      :data="tableData"
      height="100%"
      :columns="tableColumns"
    >
      <template #seq="{ rowIndex }">
        <span>{{ rowIndex + 1 }}</span>
      </template>
      <template #name="{ row }">
        <span class="required-asterisk" v-if="row.required_">*</span>
        <span>{{ row.name_ }}</span>
      </template>
      <template #value="{ row }">
        <span>{{ row.value_ }}</span>
      </template>
      <template #empty>
        <van-empty description="暂无数据" />
      </template>
    </vxe-grid>
  </div>
</template>

<script setup lang="ts" name="gct-dynamic-data-table">
  import { computed } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';

  const props = defineProps(widgetProps);

  // 表格列定义
  const tableColumns = computed((): any[] => {
    const columns: any[] = [
      { type: 'seq', width: 60, title: '序号', align: 'center' },
      { field: 'name_', title: '数据采集项名称', align: 'left', slots: { default: 'name' } },
      { field: 'value_', title: '值', align: 'center', slots: { default: 'value' } },
      { field: 'tip_text_', title: '参考值', align: 'center', width: 120 },
    ];
    return columns;
  });

  const tableData = [
    {
      id: 1,
      name_: '身高',
      value_: '180cm',
      tip_text_: '参考值：160-190cm',
      required_: true,
    },
    {
      id: 2,
      name_: '体重',
      value_: '70kg',
      tip_text_: '参考值：50-80kg',
      required_: true,
    },
  ];
</script>

<style lang="less" scoped>
  .data-collection-table {
    padding: 0 36px;
  }
  .required-asterisk {
    color: #ff4d4f;
    margin-right: 4px;
  }
</style>
