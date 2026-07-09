<template>
  <base-vxe-table
    class="h-100%"
    :tableColumns="columnDefinitions"
    :data-source="tableData"
    :loading="loading"
    :action="{ width: 200 }"
    showPagination
    v-model:pagination="pagination"
    @request-table-data="handleTableChange"
  >
    <template #operate="{ row: record }">
      <table-action-auto
        :actions="[
          {
            ifShow: () => Boolean(canFill),
            label: $t('sys.edhr.materialStatus.FORM'),
            onClick: () => handleFill(record),
          },
          {
            ifShow: () => Boolean(canForward),
            label: $t('sys.edhr.forword'),
            onClick: () => handleTaskForward(record),
          },
          {
            label: t('sys.detail'),
            onClick: () => handleView(record),
          },
        ]"
        :stopButtonPropagation="true"
      />
    </template>
  </base-vxe-table>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import { columnDefinitions, useDocumentFilling } from './useDocumentFilling';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';

  import type { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import { postOnlineFormInstanceTaskPageList } from '/@/apis/gct-apaas/OnlineFormInstanceController';

  const { t } = useI18n();

  withDefaults(
    defineProps<{
      canFill?: boolean;
      canForward?: boolean;
    }>(),
    {
      canFill: true,
      canForward: true,
    },
  );

  const { formState, activeTabKey, handleForward } = useDocumentFilling();
  const { openSingleDrawer } = useApaasEbr();

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<OnlineFormInstanceResponse[]>([]);

  onMounted(() => getTableData(1));

  watch(activeTabKey, (value) => {
    if (value === '1') {
      getTableData(1);
    }
  });

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }
    loading.value = true;
    const res = await postOnlineFormInstanceTaskPageList(
      {
        ...formState,
        type: 'UNFILLED',
      },
      {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      },
    ).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleFill = (record: OnlineFormInstanceResponse) => {
    openSingleDrawer({
      selfId: record.id,
      officeType: record.officeType,
      modelKey: record.modelKey,
      keep: false,
      isViewPage: false,
      callback: () => getTableData(1),
    });
  };

  const handleView = (record: OnlineFormInstanceResponse) => {
    openSingleDrawer({
      selfId: record.id,
      officeType: record.officeType,
      modelKey: record.modelKey,
      keep: false,
      title: $t('sys.onlineForm.formDetail'),
      isViewPage: true,
      callback: () => {},
    });
  };

  const handleTaskForward = (record: OnlineFormInstanceResponse) => {
    handleForward({
      data: record,
      callback: () => getTableData(1),
    });
  };

  defineExpose({
    getTableData,
  });
</script>

<style></style>
