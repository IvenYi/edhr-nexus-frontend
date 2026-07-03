<template>
  <base-vxe-table
    class="h-100%"
    :tableColumns="columns || UserGrantedTableColumns"
    :data-source="data"
    showPagination
    v-model:pagination="currentPagination"
    @request-table-data="handleTableChange"
  >
    <template #operate="{ row }">
      <table-action-auto
        :actions="getRowActions(row)"
        :stopButtonPropagation="true"
        :max-dispaly-count="5"
      />
    </template>
  </base-vxe-table>
</template>

<script lang="ts" setup name="user-granted-table">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ActionItem, PaginationProps, TableActionAuto } from '/@/components/Table';
  import {
    UserGrantedAction,
    UserGrantedActionMap,
    UserGrantedTableActions,
    UserGrantedTableColumns,
  } from '../logic/constants';
  import BaseVxeTable from '../../../components/base-vxe-table/index.vue';
  import { UseUserGranted } from '../logic/use-user-granted';

  const { t } = useI18n();
  const { userGrantedUsePerms } = UseUserGranted();

  const props = defineProps<{
    data?: IData[];
    pagination: PaginationProps;
    columns?: any[];
  }>();

  const emit = defineEmits<{
    (e: 'load'): void;
    (e: 'doAction', action: UserGrantedAction, row: any): void;
    (e: 'update:pagination', value: PaginationProps): void;
  }>();

  const currentPagination = computed({
    get() {
      return props.pagination;
    },
    set(v) {
      emit('update:pagination', v);
    },
  });

  /** 获取对应的操作配置 */
  const getRowActions = (row): ActionItem[] => {
    return UserGrantedTableActions.filter((action) => {
      if (action === UserGrantedAction.Handover) return userGrantedUsePerms.value.HandOver;
      return false;
    }).map((action) => {
      const item = UserGrantedActionMap[action];
      const doAction = () => {
        emit('doAction', action, row);
      };
      let result: ActionItem = {
        label: item.label,
        onClick: doAction,
      };
      return result;
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    emit('update:pagination', { current, total, pageSize });
    emit('load');
  };
</script>
