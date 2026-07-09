<template>
  <div :class="[ns.b()]">
    <basic-table
      ref="tableRef"
      :striped="false"
      :bordered="true"
      :ellipsis="true"
      :dataSource="data"
      :columns="ProductFamilyTableColumns"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name_'">
          <a
            @click.stop="$emit('doAction', ProductFamilyAction.DETAIL, toRaw(record))"
            :title="text"
            >{{ text }}</a
          >
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <table-action-auto
            :actions="getRowActions(record)"
            :stopButtonPropagation="true"
            :max-dispaly-count="5"
          />
        </template>
      </template>
    </basic-table>
  </div>
</template>

<script lang="ts" setup name="product-family-table">
  import { useNamespace } from '@gct/runtime';
  import { toRaw, ref, onActivated, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ActionItem, BasicTable, PaginationProps, TableActionAuto } from '/@/components/Table';
  import {
    ProductFamilyAction,
    ProductFamilyActionMap,
    ProductFamilyTableActions,
    ProductFamilyTableColumns,
  } from '../logic/constants';
  import { UseProductFamily } from '../logic/use-product-family';

  const { t } = useI18n();
  const { userActions } = UseProductFamily();
  const tableRef = ref();

  const ns = useNamespace('product-family-header');

  const props = defineProps<{
    data?: IData[];
    pagination: PaginationProps;
  }>();

  const emit = defineEmits<{
    (e: 'load'): void;
    (e: 'doAction', action: ProductFamilyAction, row: any): void;
    (e: 'update:pagination', value: PaginationProps): void;
  }>();

  /** 获取对应的操作配置 */
  const getRowActions = (row): ActionItem[] => {
    return ProductFamilyTableActions.filter((action) => {
      if (action === ProductFamilyAction.EDIT) return userActions.value.Update;
      if (action === ProductFamilyAction.DELETE) return userActions.value.Delete;
      if (action === ProductFamilyAction.MODELING_TRACEABILITY) return userActions.value.Trace;
      if (action === ProductFamilyAction.COPY) return userActions.value.Copy;
      return false;
    }).map((action) => {
      const item = ProductFamilyActionMap[action];
      const doAction = () => {
        emit('doAction', action, row);
      };
      let result: ActionItem = {
        label: item.label,
        color: item.color,
        onClick: doAction,
      };
      if (item.popConfirm) {
        delete result.onClick;
        result.popConfirm = { ...item.popConfirm, confirm: doAction };
      }
      return result;
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    emit('update:pagination', { current, total, pageSize });
    emit('load');
  };

  const redoHeight = () => {
    tableRef.value.redoHeight();
  };

  onMounted(() => {
    setTimeout(() => {
      redoHeight();
    }, 500);
  });
</script>

<style lang="scss" scoped>
  $product-family-header: ();

  @include b(product-family-header) {
    @include set-component-css-var(product-family-header, $product-family-header);
    display: flex;
    justify-content: space-between;

    @include e(left) {
      display: flex;
    }

    :deep(.ant-table-empty) {
      .ant-table-body {
        overflow: hidden !important;
      }
    }
  }
</style>
