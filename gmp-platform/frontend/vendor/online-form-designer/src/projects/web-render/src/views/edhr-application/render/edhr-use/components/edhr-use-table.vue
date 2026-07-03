<template>
  <div :class="[ns.b()]">
    <basic-table
      :striped="false"
      :bordered="true"
      :ellipsis="true"
      :dataSource="data"
      :columns="EdhrUseTableColumns"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name_'">
          <a @click.stop="$emit('doAction', EdhrUseAction.DETAIL, toRaw(record))">{{ text }}</a>
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

<script lang="ts" setup name="edhr-use-table">
  import { useNamespace } from '@gct/runtime';
  import { toRaw } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ActionItem, BasicTable, PaginationProps, TableActionAuto } from '/@/components/Table';
  import {
    EdhrUseAction,
    EdhrUseActionMap,
    EdhrUseTableActions,
    EdhrUseTableColumns,
  } from '../logic/constants';
  import { UseEdhrUse } from '../logic/use-edhr-use';

  const { t } = useI18n();
  const { userActions } = UseEdhrUse();

  const ns = useNamespace('edhr-use-header');

  defineProps<{
    data?: IData[];
    pagination: PaginationProps;
  }>();

  const emit = defineEmits<{
    (e: 'load'): void;
    (e: 'doAction', action: EdhrUseAction, row: any): void;
    (e: 'update:pagination', value: PaginationProps): void;
  }>();

  /** 获取对应的操作配置 */
  const getRowActions = (row): ActionItem[] => {
    return EdhrUseTableActions.filter((action) => {
      if (action === EdhrUseAction.EDIT) return userActions.value.Update;
      if (action === EdhrUseAction.DELETE) return userActions.value.Delete;
      return false;
    }).map((action) => {
      const item = EdhrUseActionMap[action];
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
</script>

<style lang="scss" scoped>
  $edhr-use-header: ();

  @include b(edhr-use-header) {
    @include set-component-css-var(edhr-use-header, $edhr-use-header);
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
