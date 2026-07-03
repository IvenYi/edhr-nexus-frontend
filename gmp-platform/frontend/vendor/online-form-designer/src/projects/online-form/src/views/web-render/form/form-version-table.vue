<template>
  <VersionTable
    :class="[ns.b()]"
    :data="data"
    v-model:pagination="_pagination"
    :columns="columns"
    @link="onLink"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'description'">
        <FormTypeTag v-if="record.children" :value="record.formType" />
        <span v-else>
          {{ record.description }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'edition'">
        <FormEditionTag :value="record.edition" />
      </template>
      <template v-if="column.dataIndex === 'actions'">
        <slot name="actions" :row="record"></slot>
      </template>
    </template>
  </VersionTable>
</template>

<script lang="ts" setup name="form-version-table">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicColumn, PaginationProps } from '/@/components/Table';
  import { FormRelateDTO } from '/@/apis/gct-apaas/model';
  import { computed } from 'vue';
  import { VersionTable } from '../components';
  import FormTypeTag from './form-type-tag.vue';
  import FormEditionTag from './form-edition-tag.vue';

  const { t } = useI18n();
  const ns = useNamespace('form-version-table');

  const props = withDefaults(
    defineProps<{
      formTitle: string;
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
      title: props.formTitle + t('sys.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 300,
      resizable: true,
    },
    {
      title: t('sys.platform.code'),
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
      width: 120,
    },
    {
      title: t('sys.pageDesigner.form') + t('sys.mode'),
      dataIndex: 'edition',
      key: 'edition',
      ellipsis: true,
      width: 150,
    },
    {
      title: t('sys.pageDesigner.form') + t('sys.type') + '/' + t('sys.description'),
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
  $form-version-table: ();

  @include b(form-version-table) {
    @include set-component-css-var(form-version-table, $form-version-table);
  }
</style>
