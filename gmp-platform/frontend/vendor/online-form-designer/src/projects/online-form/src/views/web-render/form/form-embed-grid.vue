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

<script lang="tsx" setup name="form-embed-grid">
  import { computed, ref, watch, ComputedRef } from 'vue';
  import { useNamespace } from '@gct/runtime';

  import { BasicGrid, EmbedGridColumn, GridPaginationValue } from '/@/components/ui';
  import type { FormRelateDTO } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { uuid2 } from '/@/utils/uuid';
  import { isNil } from 'lodash-es';
  import {
    ControlStatusTag,
    VersionNameTag,
    ApprovalStatusTag,
    OperatingState,
  } from '../components';
  import FormEditionTag from './form-edition-tag.vue';
  import { isEnableDocControl } from '/@online-form/views/web-render/hooks/useControl';
  import { isEnableApproveControl } from '/@online-form/views/web-render/hooks/useApproveControl';
  import FormTypeTag from './form-type-tag.vue';
  import type { VxeColumnPropTypes } from 'vxe-table';

  type TypeGridColumn = EmbedGridColumn & { hidden?: boolean };

  const ns = useNamespace('form-embed-grid');

  const props = withDefaults(
    defineProps<{
      data: FormRelateDTO[];
      formTitle: string;
      pagination?: GridPaginationValue;
    }>(),
    {},
  );

  const { t } = useI18n();

  const emit = defineEmits<{
    (e: 'update:pagination', value: GridPaginationValue): void;
    (e: 'link', value: FormRelateDTO): void;
  }>();

  const refreshKey = ref(uuid2(32));

  /** 空值的时候显示的文案 */
  const EmptyText = '--';
  const formatter: VxeColumnPropTypes.Formatter<any> = ({ cellValue }) => {
    return isNil(cellValue) || cellValue === '' ? EmptyText : cellValue;
  };

  const columns: TypeGridColumn[] = [
    {
      title: t('sys.name'),
      field: 'name',
      showOverflow: 'tooltip',
      minWidth: 260,
      treeNode: true,
      resizable: true,
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
      title: t('sys.mode'),
      field: 'edition',
      minWidth: 160,
      slots: {
        default({ row }) {
          const edition = row.edition || row?.children[0]?.edition;
          if (!edition) {
            return EmptyText;
          }
          return <FormEditionTag value={edition} />;
        },
      },
    },
    {
      title: t('sys.type'),
      field: 'formType',
      minWidth: 160,
      slots: {
        default({ row }) {
          const formType = row.formType || row?.children[0].formType;
          if (!formType) {
            return EmptyText;
          }
          return <FormTypeTag value={row.formType} />;
        },
      },
    },
    {
      title: t('sys.edhr.offlineVersion'),
      minWidth: 160,
      field: 'offlineVersion',
      formatter,
    },
    {
      title: t('sys.modifier'),
      minWidth: 200,
      field: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      minWidth: 226,
      field: 'modifyTime',
    },
    {
      title: t('sys.edhr.controlType'),
      minWidth: 160,
      fixed: 'right',
      field: 'controlStatus',
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
              onUpdate:value={(value) => (row.operatingState = value)}
            />
          );
        },
      },
      hidden: false,
    },
    {
      title: t('sys.operation'),
      field: 'actions',
      minWidth: 250,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];

  const tableColumns: ComputedRef<EmbedGridColumn[]> = computed(() => {
    return columns.filter((item) => !item.hidden);
  });

  watch(
    () => props.data,
    () => {
      refreshKey.value = uuid2(32);
    },
  );
</script>

<style lang="scss" scoped>
  $form-embed-grid: ();

  @include b(form-embed-grid) {
    @include set-component-css-var(form-embed-grid, $form-embed-grid);

    height: 100%;
  }
</style>
