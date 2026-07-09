<template>
  <a-drawer
    v-model:visible="open"
    @close="onClose"
    :title="t('sys.detail')"
    :maskStyle="{ backgroundColor: 'transparent' }"
    placement="right"
    width="70%"
    class="detail-drawer"
    :destroyOnClose="true"
  >
    <a-tabs v-model:activeKey="activeKey" type="card" @change="handleTabChange">
      <a-tab-pane key="data" :tab="t('sys.bi.data')">
        <a-table
          :loading="loading"
          :dataSource="dataSource"
          :columns="columnsData"
          bordered
          :pagination="paginationData"
          @change="handleTableDataChange"
          ref="tableContainerRef"
          :scroll="{
            y: scrollHeight,
          }"
          size="middle"
          class="gct-edhr-table h-800px"
        >
          <template #headerCell="{ column }">
            <a-tooltip>
              <template #title> {{ column?.title }}</template>
              {{ column?.title }}
            </a-tooltip>
          </template>
          <template #bodyCell="{ column, record }">
            <a-tooltip>
              <template #title> {{ record?.[column?.key] }}</template>
              {{ record?.[column?.key] }}
            </a-tooltip>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="field" :tab="t('sys.bi.field')">
        <a-table
          :loading="loadingField"
          class="gct-edhr-table h-800px"
          :dataSource="fieldSource"
          :columns="columnsField"
          bordered
          :pagination="pagination"
          @change="handleTableChange"
          ref="tableContainerRef"
          :scroll="{
            y: scrollHeight,
          }"
          size="middle"
        />
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAntTableScrollHeight } from '@gct/runtime';

  import {
    getDatabaseColumnInformation,
    getDatabaseTableDataPageList,
  } from '/@/apis/gct-platform/DatabaseController';
  import type { TablePaginationConfig } from 'ant-design-vue';

  const { t } = useI18n();

  const open = ref(false);
  const loading = ref(true);
  const loadingField = ref(true);
  const activeKey = ref('data');
  const questParams = ref<any>(null);
  const totalData = ref<number>(0);
  const totalField = ref<number>(0);

  const dataSource = ref<any>([]);
  const fieldSource = ref<any>([]);

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: totalField.value,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });
  const paginationData: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 50,
    total: totalData.value,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });
  const columnsField = [
    {
      title: t('sys.FieldName'),
      dataIndex: 'column',
      key: 'column',
    },
    {
      title: t('sys.pageDesigner.fieldType'),
      dataIndex: 'columnType',
      key: 'columnType',
    },
    {
      title: t('sys.pageDesigner.fieldDesc'),
      dataIndex: 'description',
      key: 'description',
    },
  ];
  const columnsData = ref<any[]>([]);

  const handleTableChange = async (paginationInfo) => {
    loadingField.value = true;
    Object.assign(pagination, paginationInfo);
    await handleFieldTable();
  };

  const handleTableDataChange = async (paginationInfo) => {
    loading.value = true;
    Object.assign(paginationData, paginationInfo);
    await handleDataTable();
  };

  const handleTabChange = (val) => {
    console.log('val', val);
  };
  const onClose = () => {
    open.value = false;
  };

  const handleDataTable = () => {
    getDatabaseTableDataPageList({
      ...questParams.value,
      tbName: undefined,
      tableName: questParams.value.tbName,
      pageSize: paginationData.pageSize,
      pageNo: paginationData.current,
    }).then((res) => {
      loading.value = false;
      paginationData.total = res?.total;
      dataSource.value = res?.records;
    });
  };
  const handleFieldTable = () => {
    getDatabaseColumnInformation({
      ...questParams.value,
      pageSize: pagination.pageSize,
      pageNo: pagination.current,
    }).then((res) => {
      fieldSource.value = res;
      loadingField.value = false;
      pagination.total = res?.total;
      columnsData.value = [];

      res?.forEach((item) => {
        if (item.column != '_id' && item.column != 'deleted_') {
          columnsData.value.push({
            title: item.description ?? item.column,
            dataIndex: item.column,
            key: item.column,
            width: 100,
            ellipsis: {
              tooltip: true,
            },
          });
        }
      });
    });
  };

  const showDrawer = async (params) => {
    open.value = true;
    activeKey.value = 'data';
    loadingField.value = true;
    loading.value = true;
    questParams.value = params;
    columnsData.value = [];
    dataSource.value = [];
    fieldSource.value = [];
    await handleFieldTable();
    await handleDataTable();
  };

  defineExpose({
    showDrawer,
  });
</script>

<style lang="less" scoped></style>
