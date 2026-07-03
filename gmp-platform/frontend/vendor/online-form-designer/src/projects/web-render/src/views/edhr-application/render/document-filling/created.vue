<template>
  <base-vxe-table
    class="h-100%"
    :tableColumns="columnDefinitions"
    :data-source="tableData"
    :loading="loading"
    showPagination
    :action="{ width: 300 }"
    v-model:pagination="pagination"
    @request-table-data="handleTableChange"
  >
    <template #operate="{ row: record }">
      <table-action-auto
        :actions="[
          {
            label: $t('sys.edit'),
            ifShow: () =>
              record.instanceStatus === InstanceStatusValues.UNFILLED && Boolean(canUpdate),
            onClick: () => handleTaskEdit(record),
          },
          {
            label: $t('sys.edhr.resend'),
            ifShow: () =>
              record.instanceStatus === InstanceStatusValues.UNFILLED &&
              record.resend === 0 &&
              record.dataStatus === 'SUBMIT' &&
              Boolean(canResend),
            onClick: () => handleTaskResend(record),
          },
          {
            label: t('sys.delete'),
            color: 'error',
            ifShow: () =>
              record.instanceStatus === InstanceStatusValues.UNFILLED && Boolean(canDelete),
            popConfirm: {
              title: t('sys.sureToDelete'),
              confirm: () => handleDelete(record),
            },
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
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import { columnDefinitions, useDocumentFilling } from './useDocumentFilling';
  import {
    InstanceStatusValues,
    useApaasEbr,
  } from '/@online-form/views/integration/apaas_ebr/index';
  import {
    deleteOnlineFormInstance,
    postOnlineFormInstanceTaskPageList,
    getOnlineFormInstanceTaskResendByOfInstId,
    putOnlineFormInstanceTaskUpdate,
    deleteOnlineFormInstanceTaskRemoveByOfInstId,
  } from '/@/apis/gct-apaas/OnlineFormInstanceController';

  import type { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import type { TablePaginationConfig } from 'ant-design-vue';

  const { t } = useI18n();

  withDefaults(
    defineProps<{
      canUpdate?: boolean;
      canResend?: boolean;
      canDelete?: boolean;
    }>(),
    {
      canUpdate: true,
      canResend: true,
      canDelete: true,
    },
  );

  const { formState, activeTabKey, handleCreate } = useDocumentFilling();
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
    if (value === '2') {
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
        type: 'CREATED',
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

  /** 删除单据任务 */
  const handleDelete = async (record: OnlineFormInstanceResponse) => {
    await deleteOnlineFormInstanceTaskRemoveByOfInstId({ ofInstId: record.id! });
    message.success(t('sys.doSuccess'));
    getTableData(1);
  };

  /** 编辑 */
  const handleTaskEdit = async (record: OnlineFormInstanceResponse) => {
    handleCreate({
      title: $t('sys.edhr.editTask'),
      callback: getTableData,
      request: async (data) => {
        return await putOnlineFormInstanceTaskUpdate({
          ...data,
          ofInstId: record.id!,
        });
      },
      form: {
        tmplId: record.tmplId,
        title: record.title,
        operatorRange: record.operatorRange,
        // relatedMaterialNo: record.relatedMaterialNo,
        relatedMaterialNos: record.relatedMaterialNos,
      },
      disabledTmplId: true,
    });
  };

  /** 重新发送 */
  const handleTaskResend = async (record: OnlineFormInstanceResponse) => {
    await getOnlineFormInstanceTaskResendByOfInstId({ ofInstId: record.id! });
    message.success($t('sys.edhr.resendSucess'));
    getTableData(1);
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

  defineExpose({
    getTableData,
  });
</script>

<style></style>
