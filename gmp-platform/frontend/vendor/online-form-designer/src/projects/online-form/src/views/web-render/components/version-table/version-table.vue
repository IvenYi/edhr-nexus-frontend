<template>
  <div :class="[ns.b()]">
    <basic-table
      :class="[ns.e('table')]"
      :striped="false"
      :bordered="true"
      rowKey="id"
      :expandedRowKeys="expandedRowKeys"
      :showIndexColumn="false"
      :ellipsis="true"
      :columns="columns"
      :data-source="props.data"
      :pagination="pagination"
      @change="handleTableChange"
      @resizeColumn="handleResizeColumn"
      :isCanResizeParent="true"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <VersionNameTag :data="record" @link="() => onLink(record)" />
        </template>
        <template v-else>
          <slot name="bodyCell" v-bind="{ column, record }"></slot>
        </template>
      </template>
    </basic-table>
  </div>
</template>

<script lang="ts" setup name="version-table">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { BasicTable, BasicColumn, PaginationProps } from '/@/components/Table';
  import type { FormRelateDTO } from '/@/apis/gct-apaas/model';
  import { ref, watchEffect } from 'vue';
  import VersionNameTag from '../version-name-tag/version-name-tag.vue';

  const ns = useNamespace('version-table');
  const { t } = useI18n() as any;
  const props = withDefaults(
    defineProps<{
      data?: FormRelateDTO[];
      pagination: PaginationProps;
      columns?: BasicColumn[];
    }>(),
    {
      data: () => [],
    },
  );

  const emit = defineEmits<{
    (e: 'update:pagination', value: PaginationProps): void;
    (e: 'link', value: FormRelateDTO): void;
  }>();

  /** 展开标识集合，引用不能变化不然后续变更无法生效 */
  const expandedRowKeys = ref<string[]>([]);
  watchEffect(() => {
    expandedRowKeys.value.length = 0;
    expandedRowKeys.value.push(...props.data.map((item) => item.id!));
  });

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    emit('update:pagination', { current, total, pageSize });
  };

  const onLink = (row: FormRelateDTO) => {
    emit('link', row);
  };

  const handleResizeColumn = (width: number, column: BasicColumn) => {
    column.width = width;
  };
</script>

<style lang="scss" scoped>
  $version-table: ();

  @include b(version-table) {
    @include set-component-css-var(version-table, $version-table);
    height: 100%;

    @include e(table) {
      height: 100%;
    }

    :deep(.ant-table-empty) {
      .ant-table-body {
        overflow: hidden !important;
      }
    }

    @include e(version-name) {
      color: #3168ec;
    }
  }
</style>
