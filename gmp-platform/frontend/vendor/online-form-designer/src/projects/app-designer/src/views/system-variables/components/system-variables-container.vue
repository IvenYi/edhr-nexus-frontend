<template>
  <div class="system-variables-container">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="16">
          <a-form-item name="keywords" :label="`${t('sys.appDesigner.variable')}KEY`">
            <a-input
              v-model:value="formState.keywords"
              :placeholder="t('sys.pleaseInputSth', { sth: `${t('sys.appDesigner.variable')}KEY` })"
              :style="{ width: '360px' }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-button @click="() => formRef?.resetFields()">
            <template #icon>
              <undo-outlined />
            </template>
            {{ t('sys.reset') }}
          </a-button>
          <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
            <template #icon>
              <search-outlined />
            </template>
            {{ t('sys.queryText') }}
          </a-button>
        </a-col>
      </a-row>
    </a-form>
    <div class="table-wrap">
      <BasicTable
        :dataSource="tableData"
        :columns="sysVarColumns"
        :showIndexColumn="false"
        :pagination="pagination"
        :striped="false"
        :bordered="true"
        @change="handleTableChange"
      >
        <template #headerTop>
          <a-button class="mr-16px" type="primary" @click="handleCreateSysVariables">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.new') }}
          </a-button>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  onClick: handleRowEdit.bind(null, record),
                },
                {
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDeleteSth', { sth: t('sys.appDesigner.systemVariable') }),
                    confirm: handleRowDelete.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </BasicTable>
      <system-variables-modal @register="register" @refresh="onRefresh" />
    </div>
  </div>
</template>

<script setup lang="ts" name="system-variables-container">
  import { ref, reactive, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { SearchOutlined, UndoOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { sysVarColumns } from '../constants/columns';
  import SystemVariablesModal from './system-variables-modal.vue';

  import { getSystemVarPageList, deleteSystemVar } from '/@/apis/gct-apaas/SystemVarController';

  import type { FormInstance } from 'ant-design-vue';
  import type { SystemVarResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const [register, { openModal }] = useModal();

  //搜索过滤部分
  const formRef = ref<FormInstance>();

  const formState = reactive({
    keywords: undefined,
  });

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<Array<SystemVarResponse>>([]);

  const getTableData = async (keyword?, current?) => {
    const result = await getSystemVarPageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      key: keyword || undefined,
    });
    if (result && result.data) {
      pagination.total = result.totalCount;
      tableData.value = result.data ?? [];
    }
  };

  onMounted(getTableData);

  const handleSearch = () => {
    formRef.value?.validate().then(async () => {
      // 发送网络请求获取数据
      await getTableData(formState.keywords, 1);
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const handleCreateSysVariables = () => {
    openModal(true, {
      isEdit: false,
    });
  };

  const handleRowEdit = async (record) => {
    openModal(true, {
      isEdit: true,
      info: record,
    });
  };

  const handleRowDelete = async (record) => {
    await deleteSystemVar({ ids: record.id });
    message.success(t('sys.delSuccess'));
    onRefresh();
  };
  const onRefresh = () => {
    getTableData();
  };
</script>

<style lang="less" scoped>
  .system-variables-container {
    padding: 16px;
  }
</style>
