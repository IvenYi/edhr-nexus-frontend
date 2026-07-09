<template>
  <div :class="[ns.b()]">
    <basic-table
      :striped="false"
      :bordered="true"
      :ellipsis="true"
      :showIndexColumn="false"
      rowKey="id_"
      :dataSource="data"
      :columns="ProductTableColumns"
      :pagination="pagination"
      :expandedRowKeys="expandedRowKeys"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name_'">
          <span :class="[]" v-if="record.children" :title="record.name_">
            {{ record.name_ }}
          </span>
          <span
            v-else
            :class="['ml-4px', ns.e('version-name')]"
            style="cursor: pointer"
            @click.stop="$emit('doAction', ProductAction.DETAIL, toRaw(record))"
          >
            {{ record.version_ }}
            <a-tag color="processing" v-if="!!record.default_">
              {{ t('sys.default') }}
            </a-tag>
          </span>
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
  import { ref, toRaw, watchEffect } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ActionItem, BasicTable, PaginationProps, TableActionAuto } from '/@/components/Table';
  import {
    ProductAction,
    ProductActionMap,
    ProductTableRdoActions,
    ProductTableVersionActions,
    ProductTableColumns,
  } from '../logic/constants';
  import { useProduct } from '../logic/use-product';

  const { t } = useI18n();
  const { userActions } = useProduct();

  const ns = useNamespace('product-family-header');

  const props = defineProps<{
    data?: IData[];
    pagination: PaginationProps;
  }>();

  const emit = defineEmits<{
    (e: 'load'): void;
    (e: 'doAction', action: ProductAction, row: any): void;
    (e: 'update:pagination', value: PaginationProps): void;
  }>();

  /** 获取对应的操作配置 */
  const getRowActions = (row): ActionItem[] => {
    const ProductTableActions = !row.children ? ProductTableVersionActions : ProductTableRdoActions;
    return ProductTableActions.filter((action) => {
      if (action === ProductAction.COPY) return userActions.value.Copy;
      if (action === ProductAction.DELETE) return userActions.value.Delete;
      if (action === ProductAction.CREATE_VERSION) return userActions.value.InsertVer;
      if (action === ProductAction.EDIT_VERSION) return userActions.value.UpdateVer;
      if (action === ProductAction.DELETE_VERSION) return userActions.value.DeleteVer;
      if (action === ProductAction.COPY_VERSION) return userActions.value.CopyVer;
      if (action === ProductAction.MODELING_TRACEABILITY) return userActions.value.Trace;
      return false;
    }).map((action) => {
      const item = ProductActionMap[action];
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

  /** 展开标识集合，引用不能变化不然后续变更无法生效 */
  const expandedRowKeys = ref<string[]>([]);
  watchEffect(() => {
    expandedRowKeys.value.length = 0;
    expandedRowKeys.value.push(...(props.data?.map((item) => item.id_!) || []));
  });
</script>

<style lang="scss" scoped>
  $product-family-header: ();

  @include b(product-family-header) {
    @include set-component-css-var(product-family-header, $product-family-header);
    display: flex;
    justify-content: space-between;

    @include e(version-name) {
      color: #3168ec;
    }

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
