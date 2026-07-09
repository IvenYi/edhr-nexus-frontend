<template>
  <VersionTable
    :class="[ns.b()]"
    :data="data"
    v-model:pagination="_pagination"
    :columns="columns"
    @link="onLink"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'actions'">
        <slot name="actions" :row="record"></slot>
      </template>
    </template>
  </VersionTable>
</template>

<script lang="ts" setup name="edhr-version-table">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicColumn, PaginationProps } from '/@/components/Table';
  import { FormRelateDTO } from '/@/apis/gct-apaas/model';
  import { computed } from 'vue';
  import { VersionTable } from '../components';

  const { t } = useI18n();
  const ns = useNamespace('form-version-table');

  const props = withDefaults(
    defineProps<{
      data: FormRelateDTO[];
      pagination: PaginationProps;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:pagination', value: PaginationProps): void;
    (e: 'link', value: FormRelateDTO): void;
  }>();

  const _pagination = computed({
    get() {
      return props.pagination;
    },
    set(v) {
      emit('update:pagination', v);
    },
  });

  const onLink = (row: FormRelateDTO) => {
    emit('link', row);
  };

  const columns: BasicColumn[] = [
    {
      title: 'DHR' + t('sys.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 300,
    },
    {
      title: t('sys.platform.code'),
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
      width: 120,
    },
    {
      title: t('sys.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      ellipsis: true,
      width: 120,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      ellipsis: true,
      minWidth: 170,
      width: 170,
    },
    {
      fixed: 'right',
      width: 340,
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];
</script>

<style lang="scss" scoped>
  $edhr-version-table: ();

  @include b(edhr-version-table) {
    @include set-component-css-var(edhr-version-table, $edhr-version-table);
  }
</style>
