<template>
  <div class="h-full flex flex-col">
    <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off" layout="inline">
      <div class="w-full">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item :label="t('sys.integration.envSwitch')" name="env">
              <a-select v-model:value="formState.env" @change="() => getTableData(1)">
                <a-select-option :value="item.key" v-for="item in apiEnvOptions" :key="item.key">{{
                  t(item.i18n)
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item :label="t('sys.developer.appCenter.appIdent')" name="appId">
              <a-input v-model:value="formState.appId" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item :label="t('sys.developer.appCenter.appName')" name="name">
              <a-input v-model:value="formState.name" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="6" class="text-right">
            <a-button class="mr-10px" @click="handlereset">
              {{ t('sys.reset') }}
            </a-button>
            <a-button type="primary" @click="() => getTableData(1)">
              {{ t('sys.queryText') }}
            </a-button>
          </a-col>
        </a-row>
      </div>
    </a-form>

    <a-table
      class="flex-1 h-100px mt-16px"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      :loading="loading"
      size="middle"
      ref="tableContainerRef"
      :scroll="{
        y: scrollHeight,
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'env'">
          {{ t('sys.integration.env.' + record.env) }}
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.detail'),
                onClick: () => handleDetail(record),
              },
              {
                label: t('sys.export'),
                onClick: () => handleExport(record),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { envOptions } from './../enum';
  import { downloadByUrl, downloadByData } from '/@/utils/file/download';
  import { fileUrlParser } from '/@/components/Cropper/hooks/useFile';
  import {
    getOpenapiGroupPageList,
    getOpenapiGroupListDownload,
  } from '/@/apis/gct-platform/OpenapiGroupController';
  import { OpenapiGroupResponse } from '/@/apis/gct-platform/model/index';

  const formRef = ref<FormInstance>();
  const { t } = useI18n();
  const emit = defineEmits(['goApiDetial']);

  const formState = reactive({
    env: 'test',
    appId: '',
    name: '',
  });

  const tableContainerRef = ref();
  const { scrollHeight, calcScrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const loading = ref<boolean>(false);
  const tableData = ref<OpenapiGroupResponse[]>([]);
  const apiEnvOptions = envOptions.filter((i) => i.key !== 'dev');
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  onMounted(() => {
    getTableData();
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const params = Object.assign(formState, { pageNo, pageSize: pagination.pageSize! });
    const res = await getOpenapiGroupPageList(params).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handlereset = () => {
    formRef.value?.resetFields();
    formState.env = 'test';
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.developer.appCenter.appIdent'),
      dataIndex: 'appId',
      key: 'appId',
      ellipsis: true,
    },
    {
      title: t('sys.developer.appCenter.appName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.developer.appCenter.appDesc'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.integration.belongingEnv'),
      dataIndex: 'env',
      key: 'env',
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
    },
  ];

  const handleDetail = (record) => {
    emit('goApiDetial', { id: record.id, name: record.name, appTag: record.appId });
  };

  const handleExport = async (record) => {
    const fileData = await getOpenapiGroupListDownload(
      {
        appTag: record.appId, // 应用标识
        env: record.env, // 环境
      },
      {
        isTransformResponse: false,
        transferToConfig: {
          responseType: 'blob',
          responseEncoding: 'utf8',
        },
      },
    );
    if (fileData) {
      downloadByData(fileData, {
        filename: '.pdf',
        timestamp: true,
        mime: 'application/pdf',
      });
    }
  };

  defineExpose({
    calcScrollHeight,
  });
</script>

<style lang="less" scoped></style>
