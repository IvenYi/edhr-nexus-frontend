<template>
  <base-vxe-table
    class="h-100%"
    :tableColumns="columnDefinitions"
    :data-source="tableData"
    :loading="loading"
    showPagination
    v-model:pagination="pagination"
    :action="{ width: 130 }"
    @request-table-data="handleTableChange"
  >
    <template #custom_item="{ column: { field }, record }">
      {{ record.taskType ? t('sys.edhr.changeType.' + record.taskType) : record.taskType }}
    </template>
    <template #operate="{ row: record }">
      <table-action-auto
        :actions="[
          {
            ifShow: () => Boolean(canHandle),
            label: $t('sys.edhr.handle'),
            onClick: () => handleTask(record),
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
  import { TableActionAuto } from '/@/components/Table';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import { useChangeTask } from './useChangeTask';
  import { getProcessTaskTodoPageList } from '/@/apis/gct-apaas/ProcessTaskTodoController';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import type { ProcessTaskTodoResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();
  const emit = defineEmits(['handle']);

  withDefaults(
    defineProps<{
      canHandle?: boolean;
    }>(),
    {
      canHandle: true,
    },
  );

  const columnDefinitions = [
    { title: $t('sys.edhr.changedNo'), field: 'businessCode', minWidth: 150 },
    {
      title: $t('sys.type'),
      field: 'taskType',
      minWidth: 130,
      slots: { default: 'custom_render' },
    },
    { title: $t('sys.onlineForm.formIdent'), field: 'serialNo', minWidth: 150 },
    { title: $t('sys.webRender.onlineFormTitle'), field: 'title', minWidth: 150 },
    { title: $t('sys.onlineForm.formName'), field: 'ofTmplName', minWidth: 150 },
    { title: $t('sys.onlineForm.formTmplCode'), field: 'ofCode', minWidth: 150 },
    { title: $t('sys.creator'), field: 'ofCreateUserName' },
    { title: $t('sys.createTime'), field: 'taskStartTime', minWidth: 176 },
  ];

  const { formState, activeTabKey } = useChangeTask();

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<ProcessTaskTodoResponse[]>([]);

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
    const res = await getProcessTaskTodoPageList({
      ...formState,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      showChange: 1,
    }).finally(() => {
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

  // 表单审核页面【处理按钮】
  const handleTask = (record: ProcessTaskTodoResponse) => {
    emit('handle', record);
  };

  // 表单审核页面【处理按钮】
  const handleView = (record: ProcessTaskTodoResponse) => {
    emit('detail', record);
  };

  defineExpose({
    getTableData,
  });
</script>

<style></style>
