<template>
  <a-pagination
    :class="[ns.b()]"
    v-model:current="local.current"
    v-model:page-size="local.pageSize"
    :total="local.total"
    v-bind="styleAttr"
  />
</template>

<script lang="ts" setup name="grid-pagination">
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { GridPaginationValue } from './types';

  const { t } = useI18n();
  const ns = useNamespace('grid-pagination');

  const props = withDefaults(
    defineProps<{
      value: GridPaginationValue;
    }>(),
    {
      value: undefined,
    },
  );

  const styleAttr = {
    class: 'ant-pagination mini ant-table-pagination ant-table-pagination-right',
    size: 'small',
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '40', '50'],
    showTotal: (total) => t('sys.component.table.total', { total }),
  } as any;

  const emit = defineEmits<{
    (e: 'update:value', value: GridPaginationValue): void;
  }>();

  const local = computedEx({
    get: () => {
      return props.value;
    },
    set: (v) => {
      emit('update:value', v);
    },
    deep: true,
  });
</script>

<style lang="scss" scoped>
  $grid-pagination: ();

  @include b(grid-pagination) {
    @include set-component-css-var(grid-pagination, $grid-pagination);
    &.ant-table-pagination.ant-pagination {
      margin: 0;
      padding: 16px 0;
    }
  }
</style>
