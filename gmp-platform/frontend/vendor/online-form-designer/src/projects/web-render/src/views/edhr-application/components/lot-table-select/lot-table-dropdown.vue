<template>
  <base-vxe-table
    ref="xTable"
    :columns="columns"
    :tableData="tableData"
    :modelValue="modelValue"
    :loading="loading"
    :paginationAttr="paginationAttr"
    :rowSelectionMode="rowSelectionMode"
    show-row-selection-mode
    @change-select="onChangeSelect"
    @request="onSizeChange"
  />
</template>

<script setup lang="ts" name="lot-table-dropdown">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { merge } from 'lodash-es';
  import BaseVxeTable from '/@online-form/views/render/__components__/_field_/trace/common/base-vxe-table.vue';
  import {
    getColumns,
    transformLotData,
  } from '/@online-form/views/render/__components__/_field_/trace/utils/columns';
  import { useSelectTable } from '/@online-form/views/render/__components__/_field_/trace/composables/useSelectTable';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      fetch: Function;
      rowSelectionMode?: 'single' | 'multiple';
      tableColumns?: string[];
      pageAttr?: any;
    }>(),
    {
      rowSelectionMode: 'single',
    },
  );

  const emit = defineEmits(['change-select']);

  const isMultiple = computed(() => props.rowSelectionMode === 'multiple');

  const columns = computed(() => {
    const defaultColumns = ['lot2sn', 'productCode', 'productName', 'spec'];
    return getColumns([
      isMultiple.value ? 'checkbox' : 'radio',
      ...(props.tableColumns || defaultColumns),
    ]);
  });

  const fetcher = async ({ keyword = '', pageNo, pageSize }) => {
    const res = await props.fetch({
      keyword,
      pageNo,
      pageSize,
    });

    const info = transformLotData(res?.options ?? [], props.modelValue ?? undefined, [
      'material_no_',
      'material_no_',
    ]);

    return {
      data: info.data || [],
      totalCount: Number(res?.totalCount ?? 0),
      highlightIdx: info.highlightIdx,
    };
  };

  const { xTable, loading, tableData, pagination, search, onSizeChange } = useSelectTable(
    fetcher,
    merge(
      {},
      transformLotData([], props.modelValue ?? undefined, ['material_no_', 'material_no_']),
      {
        total: 0,
      },
    ),
  );

  const paginationAttr = computed(() => ({
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30'],
    showTotal: (total: number) => t('sys.component.table.total', { total }),
    ...(props.pageAttr || {}),
  }));

  const onChangeSelect = (row: any, isChecked?: boolean) => {
    emit('change-select', row, isChecked);
  };

  defineExpose({
    getRef: () => xTable.value,
    search: search,
  });
</script>
