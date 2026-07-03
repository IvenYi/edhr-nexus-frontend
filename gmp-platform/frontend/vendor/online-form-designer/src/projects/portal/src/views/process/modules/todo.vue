<template>
  <div class="flex flex-col h-full">
    <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off" layout="inline">
      <div class="w-full">
        <a-row :gutter="24">
          <a-col :span="8">
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
          <a-col :span="8">
            <a-form-item
              name="processTitle"
              :label="t('sys.titleOfSth', { sth: t('sys.process.index') })"
            >
              <a-input v-model:value="formState.processTitle" />
            </a-form-item>
          </a-col>
          <a-col :span="8" style="text-align: right">
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

    <div class="flex-1 h-10px" ref="tableContainerRef">
      <a-table
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
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import type { PmTaskTodoResponse, AppProcess } from '/@/apis/gct-platform/model';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import {
    getPmTaskTodoProcess,
    getPmTaskTodoPageList,
    getPmTaskTodoPageListQueryInterface,
  } from '/@/apis/gct-platform/PmTaskTodoController';
  import { useProcessPage } from '/@/hooks/web/useProcessPage';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const { mitt } = useMitt();
  const { t } = useI18n();
  const formRef = ref<FormInstance>();
  const appProcess = ref<AppProcess[]>([]);

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const formState: getPmTaskTodoPageListQueryInterface = reactive({
    processId: undefined,
    processTitle: undefined,
  });
  const tableData = ref<PmTaskTodoResponse[]>([]);
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
      title: t('sys.process.currentNode'),
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: t('sys.process.submitBy'),
      dataIndex: 'initiatorName',
      key: 'initiatorName',
    },
    {
      title: t('sys.process.submitOrg'),
      dataIndex: 'initiatorOrgName',
      key: 'initiatorOrgName',
    },
    {
      title: t('sys.process.submitTime'),
      dataIndex: 'taskStartTime',
      key: 'taskStartTime',
      width: 180,
    },
  ];

  onMounted(() => {
    getPmTaskTodoProcess().then((res) => {
      appProcess.value = res ?? [];
    });
    getTableData().then(() => {
      mitt.emit('process-center-todo', pagination.total);
    });
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;

    const res = await getPmTaskTodoPageList({
      ...formState,
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.total = res!.totalCount;
    tableData.value = res!.data || [];
  };

  const handleSearch = () => {
    getTableData(1);
  };

  const handleTitleClick = async (rowData) => {
    const { goTodoPage } = useProcessPage(rowData);
    await goTodoPage();
  };
</script>

<style></style>
