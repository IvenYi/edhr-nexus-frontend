<template>
  <base-vxe-table
    ref="xTable"
    :columns="columns"
    :tableData="tableData"
    :modelValue="modelValue"
    :loading="loading"
    :paginationAttr="paginationAttr"
    show-row-selection-mode
    @change-select="onChangeSelect"
    @request="onSizeChange"
    :wrapperHeight="wrapperHeight"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { merge } from 'lodash-es';
  import { useWidgetStaticAttrs, renderUtils } from '@gct/nocode-base';

  import BaseVxeTable from './base-vxe-table.vue';
  import { getColumns, transformLotData } from '../utils/columns';
  import { useSelectTable } from '../composables/useSelectTable';
  import type { ITrace } from '@gct/nocode-base';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      widget: ITrace;
      modelValue?: string;
      wrapperHeight?: number;
      /** 额外的搜索条件 */
      extraQuery?: any;
    }>(),
    {
      extraQuery: () => ({}),
      wrapperHeight: 360,
    },
  );

  const emit = defineEmits(['change-select']);

  const { options: initialOptions, newTotalCount } = useWidgetStaticAttrs(props.widget);

  const columns = computed(() =>
    getColumns(['radio', 'lot2sn', 'productCode', 'productName', 'spec']),
  );

  const fetcher = async ({ keyword = '', pageNo, pageSize }) => {
    const queryData =
      keyword && String(keyword).trim()
        ? (['material_no_'] as string[]).reduce((total: Record<string, any>, filedKey) => {
            const expkey = filedKey.split('.').length > 1 ? filedKey : filedKey + '.like';
            total[expkey] = keyword;
            return total;
          }, {})
        : {};

    const res = await renderUtils.requestLot2SnOptions({
      isMaterialConsumeField: props.widget.props.isMaterialConsumeField,
      queryData: {
        ...queryData,
        ...props.extraQuery,
      },
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
      transformLotData(initialOptions ?? [], props.modelValue ?? undefined, [
        'material_no_',
        'material_no_',
      ]),
      {
        total: newTotalCount,
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
  }));

  const onChangeSelect = (row: any) => {
    emit('change-select', row);
  };

  defineExpose({
    getRef: () => xTable.value,
    search: search,
  });
</script>
