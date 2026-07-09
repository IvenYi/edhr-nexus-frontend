<template>
  <base-vxe-table
    class="h-100%"
    :tableColumns="columnDefinitions"
    :data-source="tableData"
    :loading="loading"
    showPagination
    v-model:pagination="pagination"
    @request-table-data="handleTableChange"
  >
    <template #operate="{ row: record }">
      <table-action-auto
        :actions="[
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
  import { useTask } from './useTask';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import type { getDocControlTaskDonePageListQueryInterface } from '/@/apis/gct-apaas/DocControlTaskDoneController';
  import { getDocControlTaskDonePageList } from '/@/apis/gct-apaas/DocControlTaskDoneController';
  import {
    ModalName,
    openApprovalSubjectInfoModal,
  } from '/@/projects/web-render/src/views/edhr-application/components/approval-process-temp';
  import { getDocControlStartedInfo } from '/@/apis/gct-apaas/DocControlStartedController';

  const { t } = useI18n();

  const columnDefinitions = [
    { title: t('sys.edhr.controlFileName'), field: 'docName', minWidth: 160 },
    { title: t('sys.edhr.controlFileCode'), field: 'docCode', minWidth: 160 },
    { title: t('sys.appDesigner.version'), field: 'version' },
    { title: t('sys.edhr.subcategory'), field: 'categoryName' },
    {
      title: t('sys.edhr.controlFileType'),
      field: 'controlTmplType',
      minWidth: 140,
      params: { i18nPrefix: 'sys.edhr.intervention' },
      slots: { default: 'value_i18n_render' },
    },
    { title: t('sys.edhr.businessOfflineVersion'), field: 'offlineVersion', minWidth: 120 },
    { title: t('sys.edhr.controlReporter'), field: 'initiatorName' },
    { title: t('sys.edhr.controlReportTime'), field: 'startTime', minWidth: 176 },
  ];

  const { formState, activeTabKey } = useTask();

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<getDocControlTaskDonePageListQueryInterface[]>([]);

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
    const res = await getDocControlTaskDonePageList({
      ...formState,
      taskType: 'ROUTING',
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
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

  const handleView = async (record: getDocControlTaskDonePageListQueryInterface | any) => {
    const isFormType = record.controlTmplType === 'FORM';
    const subjectData = await getTaskSubjectData(record.docControlStartedId);

    await openApprovalSubjectInfoModal(
      {
        ...subjectData,
        businessId: record.id,
        name: record.docName,
        code: record.docCode,
      },
      isFormType ? ModalName.OnlineFormTemp : ModalName.EDHRTemp,
      { detailMode: true, width: 1200 },
    );
  };

  const getTaskSubjectData = async (taskId: string) => {
    try {
      const subjectData = await getDocControlStartedInfo({ id: taskId });
      return subjectData;
    } catch (error) {
      return {};
    }
  };

  defineExpose({
    getTableData,
  });
</script>

<style></style>
