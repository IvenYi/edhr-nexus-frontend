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

<script setup lang="ts" name="rdo-table-dropdown">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { merge } from 'lodash-es';
  import BaseVxeTable from '/@online-form/views/render/__components__/_field_/trace/common/base-vxe-table.vue';
  import RdoVersionNameTag from '/@online-form/views/render/__components__/_field_/trace/common/rdo-version-name-tag.vue';
  import {
    getColumns,
    transformTreeData,
  } from '/@online-form/views/render/__components__/_field_/trace/utils/columns';
  import { useSelectTable } from '/@online-form/views/render/__components__/_field_/trace/composables/useSelectTable';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault: boolean;
      fetch: Function;
    }>(),
    {
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault: true,
    },
  );

  const emit = defineEmits(['change-select']);

  const columns = computed(() => getColumns(['code', 'name', 'spec', 'uom', 'desc'], true));

  const fetcher = async ({ keyword = '', pageNo, pageSize }) => {
    const res = await props.fetch({
      keyword,
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
      merge({}, transformTreeData([], props.modelValue ?? undefined), {
        total: 0,
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

<style scoped></style>
