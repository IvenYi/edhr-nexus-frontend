<template>
  <div class="flex flex-col h-full">
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="inline">
      <div class="w-full">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item name="processId" label="">
              <a-select v-model:value="formState.valid" allow-clear>
                <a-select-option value="true">{{
                  t('sys.process.currentDelegation')
                }}</a-select-option>
                <a-select-option value="false">{{
                  t('sys.process.delegationHistory')
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8" :offset="8">
            <a-button class="float-right" type="primary" @click="handleAdd">
              <i class="iconfont icon-faqiweituo important-text-14px mr-2px"></i>
              {{ t('sys.process.createDelegation') }}
            </a-button>
          </a-col>
        </a-row>
      </div>
    </a-form>

    <a-table
      class="flex-1 h-10px"
      ref="tableContainerRef"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      :loading="loading"
      size="middle"
      :scroll="{
        y: scrollHeight,
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'appProcessList'">
          <template v-for="a in record.appProcessList" :key="a.appTag">
            <a-tag class="delegation__process" v-for="p in a.processList" :key="p.processKey">
              {{ p.processName }}
            </a-tag>
          </template>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag class="delegation__status" :color="DelefationStatusMap[record.status].color">{{
            t(DelefationStatusMap[record.status].i18n)
          }}</a-tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.edit'),
                onClick: () => handleEdit(record),
                ifShow: [DelefationStatusEnum.STARTED, DelefationStatusEnum.NOT_STARTED].includes(
                  record.status,
                ),
              },
              {
                label: t('取消委托'),
                color: 'error',
                popConfirm: {
                  title: t('sys.process.sureToCancelDelegation'),
                  confirm: () => handleCancel(record),
                },
                ifShow: record.status === DelefationStatusEnum.STARTED,
              },
              {
                label: t('sys.delete'),
                color: 'error',
                popConfirm: {
                  title: t('sys.sureToDelete'),
                  confirm: () => handleDelete(record),
                },
                ifShow: record.status === DelefationStatusEnum.NOT_STARTED,
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </a-table>

    <delegation-modal @register="register" :app-process="appProcess" @ok="handleModalOk" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import type { AppProcess, TaskDelegateResponse } from '/@/apis/gct-platform/model';
  import {
    getTaskDelegateProcess,
    getTaskDelegatePageList,
    postTaskDelegateCancelById,
    deleteTaskDelegate,
    getTaskDelegateInfo,
  } from '/@/apis/gct-platform/TaskDelegateController';
  import { useModal } from '/@/components/Modal';
  import DelegationModal from './modals/delegation-modal.vue';
  import { DelefationStatusEnum, DelefationStatusMap } from '../enum';
  import { message } from 'ant-design-vue';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';

  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const formRef = ref<FormInstance>();
  const appProcess = ref<AppProcess[]>([]);

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  interface IRequest {
    valid: 'true' | 'false';
  }

  const formState: IRequest = reactive({
    valid: 'true',
  });
  const tableData = ref<TaskDelegateResponse[]>([]);
  // 分页
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });
  const loading = ref<boolean>(false);

  const columns: TableColumnsType = [
    {
      title: t('sys.process.delegationTo'),
      dataIndex: 'delegateUserName',
      key: 'delegateUserName',
    },
    {
      title: t('sys.process.delegationTime'),
      dataIndex: 'startAt',
      key: 'startAt',
      customRender: ({ text, record }) => {
        return `${text.substring(0, 16)} ${t('sys.to')} ${record.endAt.substring(0, 16)}`;
      },
    },
    {
      title: t('sys.status'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('sys.process.delegationProcess'),
      dataIndex: 'appProcessList',
      key: 'appProcessList',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  watch(
    () => formState.valid,
    () => {
      getTableData(1);
    },
  );

  getTaskDelegateProcess().then((res) => {
    appProcess.value = (res ?? []).map((a) => {
      a.processList = a.processList?.map((p) => {
        p.processKey = a.appTag + '.' + p.processKey;
        return p;
      });
      return a;
    });
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getTaskDelegatePageList({
      valid: formState.valid as any,
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.total = res!.totalCount;
    tableData.value = res!.data;
  };
  getTableData();

  const handleModalOk = (refresh = true) => {
    getTableData(refresh ? 1 : undefined);
  };

  const handleAdd = () => {
    openModal(true, {});
  };

  const handleEdit = async ({ id }) => {
    const res = await getTaskDelegateInfo({ id });
    openModal(true, res);
  };

  const handleDelete = async ({ id }) => {
    await deleteTaskDelegate({
      ids: id,
    });
    message.success(t('sys.operationSuccess'));
    getTableData(1);
  };
  const handleCancel = async ({ id }) => {
    await postTaskDelegateCancelById({
      id,
    });
    message.success(t('sys.operationSuccess'));
    getTableData();
  };
</script>

<style lang="less" scoped>
  .delegation__status.ant-tag {
    margin-right: 0;
  }
  .delegation__process.ant-tag {
    margin: 3px;
  }
</style>
