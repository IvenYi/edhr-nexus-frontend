<template>
  <BasicGrid
    :class="[ns.b()]"
    :columns="tableColumns"
    :data="data"
    :pagination="pagination"
    :tree-config="{ expandAll: true }"
    :isExpandAll="true"
    :isFitParent="true"
    @update:pagination="emit('update:pagination', $event)"
  >
    <template #actions="{ row }">
      <slot name="actions" :row="row"></slot>
    </template>
  </BasicGrid>
</template>

<script lang="tsx" setup name="edhr-embed-grid">
  import { computed } from 'vue';
  import { useNamespace } from '@gct/runtime';

  import { BasicGrid, EmbedGridColumn } from '/@/components/ui';
  import type { FormRelateDTO } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PaginationProps } from '/@/components/Table';
  import {
    ControlStatusTag,
    VersionNameTag,
    ApprovalStatusTag,
    OperatingState,
  } from '../components';
  import { isEnableDocControl } from '/@online-form/views/web-render/hooks/useControl';
  import { isEnableApproveControl } from '/@online-form/views/web-render/hooks/useApproveControl';
  import { isNil } from 'lodash-es';
  import type { VxeColumnPropTypes } from 'vxe-table';

  type TypeGridColumn = EmbedGridColumn & { hidden?: boolean };

  const ns = useNamespace('edhr-embed-grid');

  withDefaults(
    defineProps<{
      data: FormRelateDTO[];
      pagination: PaginationProps;
    }>(),
    {},
  );

  const { t } = useI18n();

  const emit = defineEmits<{
    (e: 'update:pagination', value: PaginationProps): void;
    (e: 'link', value: FormRelateDTO): void;
  }>();

  /** 空值的时候显示的文案 */
  const EmptyText = '--';
  const formatter: VxeColumnPropTypes.Formatter<any> = ({ cellValue }) => {
    return isNil(cellValue) || cellValue === '' ? EmptyText : cellValue;
  };

  const columns: TypeGridColumn[] = [
    {
      title: t('sys.name'),
      field: 'name',
      minWidth: 260,
      showOverflow: 'tooltip',
      resizable: true,
      treeNode: true,
      slots: {
        default({ row }) {
          if (row.children) {
            return row.name;
          }
          return <VersionNameTag data={row} onLink={() => emit('link', row)} />;
        },
      },
    },
    {
      title: t('sys.platform.code'),
      field: 'code',
      minWidth: 240,
      resizable: true,
      showOverflow: 'tooltip',
      formatter,
    },
    {
      title: t('sys.edhr.offlineVersion'),
      field: 'offlineVersion',
      minWidth: 160,
      formatter,
    },
    {
      title: t('sys.modifier'),
      field: 'modifyUserName',
      minWidth: 200,
    },
    {
      title: t('sys.modifyTime'),
      field: 'modifyTime',
      minWidth: 226,
    },
    {
      title: t('sys.edhr.controlType'),
      fixed: 'right',
      field: 'controlStatus',
      minWidth: 160,
      slots: {
        default({ row }) {
          if (row.children) {
            return EmptyText;
          }
          return <ControlStatusTag value={row.controlStatus} />;
        },
      },
      hidden: !isEnableDocControl() || isEnableApproveControl(),
    },
    {
      title: t('sys.edhr.approveStatus'),
      minWidth: 160,
      fixed: 'right',
      field: 'approveStatus',
      slots: {
        default({ row }) {
          if (row.children) {
            return EmptyText;
          }
          return <ApprovalStatusTag value={row.approveStatus} />;
        },
      },
      hidden: !isEnableApproveControl(),
    },
    {
      title: t('sys.edhr.operatingState'),
      minWidth: 160,
      fixed: 'right',
      field: 'operatingState',
      slots: {
        default({ row }) {
          if (row.children) {
            return EmptyText;
          }
          return (
            <OperatingState
              value={row.operatingState}
              rowData={row}
              modelKey="em_edhr_tmpl"
              onUpdate:value={(value) => (row.operatingState = value)}
            />
          );
        },
      },
      hidden: false,
    },

    {
      minWidth: 250,
      fixed: 'right',
      title: t('sys.operation'),
      field: 'actions',
      slots: { default: 'actions' },
    },
  ];

  const tableColumns: ComputedRef<EmbedGridColumn[]> = computed(() => {
    return columns.filter((item) => !item.hidden);
  });
</script>

<style lang="scss" scoped>
  $edhr-embed-grid: ();

  @include b(edhr-embed-grid) {
    @include set-component-css-var(edhr-embed-grid, $edhr-embed-grid);
    height: 100%;
  }
</style>
