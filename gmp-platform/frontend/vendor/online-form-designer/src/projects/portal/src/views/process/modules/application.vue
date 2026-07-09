<template>
  <div class="flex flex-col h-full">
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="inline">
      <div class="w-full">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item
              name="processId"
              :label="t('sys.nameOfSth', { sth: t('sys.process.index') })"
            >
              <a-select
                v-model:value="formState.processId"
                allow-clear
                :placeholder="t('sys.chooseText')"
              >
                <a-select-opt-group v-for="a in appProcess" :key="a.appTag" :label="a.appName">
                  <a-select-option
                    v-for="p in a.processList"
                    :value="p.processId"
                    :key="p.processId"
                    >{{ p.processName }}</a-select-option
                  >
                </a-select-opt-group>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="status" :label="t('sys.status')">
              <a-select v-model:value="formState.status" allow-clear>
                <a-select-option
                  v-for="value in Object.values(ProcessStatusEnum)"
                  :value="value"
                  :key="value"
                  >{{ t(ch_ProcessStatusMap[value]) }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item
              name="processTitle"
              :label="t('sys.titleOfSth', { sth: t('sys.process.index') })"
            >
              <a-input v-model:value="formState.processTitle" />
            </a-form-item>
          </a-col>
          <a-col :span="6" style="text-align: right">
            <a-button @click="() => formRef?.resetFields()">
              <template #icon>
                <undo-outlined />
              </template>
              {{ t('sys.reset') }}
            </a-button>
            <a-button class="ml-10px" type="primary" @click="handleSearch">
              <template #icon>
                <search-outlined />
              </template>
              {{ t('sys.queryText') }}
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
        <template v-if="column.key === 'title'">
          <a @click.prevent="handleTitleClick(record)">{{ record.title }}</a>
        </template>
        <!-- <template v-if="column.key === 'taskNames'">
          <div v-for="(item, index) in record.taskNames" :key="index"> {{ item }}</div>
        </template>
        <template v-if="column.key === 'assigneeNames'">
          <div v-for="(item, index) in record.assigneeNames" :key="index"> {{ item }}</div>
        </template> -->
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { AppProcess, PmProcessInstanceResponse } from '/@/apis/gct-platform/model';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import {
    getPmProcessInstanceProcess,
    getPmProcessInstancePageList,
  } from '/@/apis/gct-platform/PmProcessInstanceController';
  import { useProcessPage } from '/@/hooks/web/useProcessPage';
  import { ProcessStatusEnum, ch_ProcessStatusMap } from '@gct/runtime';

  const { t } = useI18n();
  const formRef = ref<FormInstance>();
  const appProcess = ref<AppProcess[]>([]);

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  interface IFormState {
    status: ProcessStatusEnum;
    processId?: string;
    processTitle?: string;
  }

  const formState: IFormState = reactive({
    status: ProcessStatusEnum.APPROVING,
    processId: undefined,
    processTitle: undefined,
  });
  const tableData = ref<PmProcessInstanceResponse[]>([]);
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
      title: t('sys.titleOfSth', { sth: t('sys.process.index') }),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('sys.nameOfSth', { sth: t('sys.process.index') }),
      dataIndex: 'procDefName',
      key: 'procDefName',
    },
    {
      title: t('sys.process.submitTime'),
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: t('sys.process.currentNode'),
      dataIndex: 'taskNames',
      key: 'taskNames',
    },
    {
      title: t('sys.process.currentNodeHandleBy'),
      dataIndex: 'assigneeNames',
      key: 'assigneeNames',
    },
  ];

  onMounted(() => {
    getPmProcessInstanceProcess().then((res) => {
      appProcess.value = res ?? [];
    });

    getTableData();
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getPmProcessInstancePageList({
      ...formState,
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.total = res!.totalCount;
    tableData.value =
      res!.data?.map((item) => {
        try {
          item.taskNames = JSON.parse(item.taskNames!);
        } catch (err) {
          console.warn(err);
        }
        try {
          item.assigneeNames = JSON.parse(item.assigneeNames!);
        } catch (err) {
          console.warn(err);
        }
        item['processInstanceId'] = item.id;
        return item;
      }) || [];
  };

  const handleSearch = () => {
    getTableData(1);
  };

  const handleTitleClick = async (rowData) => {
    const { goMyApplicationPage } = useProcessPage(rowData);
    await goMyApplicationPage();
  };
</script>

<style lang="less" scoped></style>
