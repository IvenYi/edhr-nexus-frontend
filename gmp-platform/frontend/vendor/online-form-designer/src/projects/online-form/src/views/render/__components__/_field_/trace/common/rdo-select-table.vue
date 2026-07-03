<template>
  <base-vxe-table
    ref="xTable"
    :columns="columns"
    :tableData="tableData"
    :modelValue="modelValue"
    :loading="loading"
    :paginationAttr="paginationAttr"
    :treeConfig="{ rowField: 'id_', childrenField: 'children', expandAll: true }"
    @change-select="onChangeSelect"
    @request="onSizeChange"
  >
    <template #rdo_version_render="{ record }">
      <rdo-version-name-tag :data="record" />
    </template>
  </base-vxe-table>
</template>

<script setup lang="ts" name="base-vxe-table">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { merge } from 'lodash-es';
  import { useWidgetStaticAttrs, renderUtils } from '@gct/nocode-base';
  import BaseVxeTable from './base-vxe-table.vue';
  import RdoVersionNameTag from './rdo-version-name-tag.vue';
  import { getColumns, transformTreeData } from '../utils/columns';
  import { useSelectTable } from '../composables/useSelectTable';
  import type { ITrace } from '@gct/nocode-base';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      widget: ITrace;
      modelValue?: string;
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault: boolean;
      /** 额外的搜索条件 */
      extraQuery?: any;
    }>(),
    {
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault: true,
      extraQuery: () => ({}),
    },
  );

  const emit = defineEmits(['change-select']);

  const {
    field,
    modelKey,
    refModelKey,
    options: initialOptions,
    newTotalCount,
    dataRelationShip,
  } = useWidgetStaticAttrs(props.widget);

  const columns = computed(() => getColumns(['code', 'name', 'spec', 'uom', 'desc'], true));

  const fetcher = async ({ keyword = '', pageNo, pageSize }) => {
    const queryData =
      keyword && String(keyword).trim()
        ? (dataRelationShip?.productSearchFields || 'name_,code_')
            .split(',')
            .reduce((total: Record<string, any>, filedKey: string) => {
              const expkey = filedKey.split('.').length > 1 ? filedKey : filedKey + '.like';
              total[expkey] = keyword;
              return total;
            }, {})
        : {};
    const res = await renderUtils.requestRefOptions({
      modelKey,
      fieldKey: field,
      refModelKey,
      isRdo: true,
      exp: `OR(${(dataRelationShip?.productSearchFields || 'name_,code_')
        .split(',')
        .map((k: string) => `${k}.like`)
        .join(',')})`,
      queryData: {
        ...queryData,
        ...props.extraQuery,
        operating_state_: true,
      },
      pageNo,
      pageSize,
    });

    const info = transformTreeData(res?.options ?? [], props.modelValue ?? undefined);
    return {
      data: info.data || [],
      totalCount: Number(res?.totalCount ?? 0),
      highlightIdx: info.highlightIdx,
    };
  };

  const { xTable, loading, tableData, pagination, search, setCurrentRowHighlight, onSizeChange } =
    useSelectTable(
      fetcher,
      merge({}, transformTreeData(initialOptions ?? [], props.modelValue ?? undefined), {
        total: newTotalCount,
      }),
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

    if (props.parentToDefault && row?.__DEFAULT__) {
      setCurrentRowHighlight({
        parent: row.__P_POS__,
        child: row.__DEFAULT__.__C_POS__,
      });
    } else {
      setCurrentRowHighlight({
        parent: row.__P_POS__,
        child: row.__C_POS__,
      });
    }
  };

  defineExpose({
    getRef: () => xTable.value,
    search: search,
  });
</script>
