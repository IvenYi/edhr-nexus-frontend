<template>
  <basic-page-render>
    <div class="p-16px flex flex-col h-full">
      <search-form :formData="form" :initData="initSearchList" @on-query="() => getTableData(1)" />
      <div class="ks-col ks-column overflow-hidden">
        <div class="text-right mb16px">
          <a-button type="primary" v-if="serviceDictionaryUsePerms.Insert" @click="onAdd()">
            <icon-next
              value="icon-platform:platform-xinjian"
              class="icon-next mr8px !align-middle"
              :size="16"
            />
            {{ t('sys.new') }}
          </a-button>
        </div>

        <base-vxe-table
          class="h-100%"
          :tableColumns="columnDefinitions"
          :data-source="tableData"
          :loading="loading"
          showPagination
          v-model:pagination="pagination"
          @request-table-data="handleTableChange"
        >
          <template #operate="{ row, rowIndex }">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  ifShow: () => Boolean(serviceDictionaryUsePerms.Update),
                  onClick: () => onAdd(row, row.source === 'BUILTIN'),
                },
                {
                  ifShow: () =>
                    row.source !== 'BUILTIN' && Boolean(serviceDictionaryUsePerms.Delete),
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDo'),
                    confirm: () => onDelete(row),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </base-vxe-table>
      </div>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { message, TablePaginationConfig } from 'ant-design-vue';
  import { onMounted, reactive, ref, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import addModal from './components/add-modal.vue';
  import { TableActionAuto } from '/@/components/Table';
  import {
    deleteEnumModel,
    getEnumModelPageList,
  } from '../../../../../apis/gct-apaas/EnumModelController';
  import { EnumModelResponse } from '../../../../../apis/gct-apaas/model';
  import SearchForm from '../edhr-application/components/search-form/index.vue';
  import BaseVxeTable from '../edhr-application/components/base-vxe-table/index.vue';
  import { usePagePermissions } from '../edhr-application/hooks/usePagePermissions';

  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: '业务字典名称',
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
    {
      type: 'input',
      label: '业务字典编码',
      id: 'code',
      model: 'code',
      maxLength: 32,
    },
  ];

  const columnDefinitions = [
    { title: '业务字典名称', field: 'name', minWidth: 300 },
    { title: '业务字典编码', field: 'code', minWidth: 250 },
    { title: '描述', field: 'description', minWidth: 300 },
    { title: '修改人', field: 'modifyUserName' },
    { title: '修改时间', field: 'modifyTime', minWidth: 176 },
  ];

  const form = ref({});
  const loading = ref(false);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const tableData = ref<Array<EnumModelResponse>>([]);

  const serviceDictionaryUsePerms = usePagePermissions('service-dictionary');

  onMounted(() => getTableData(1));

  async function getTableData(initCurrent = 0) {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }
    loading.value = true;
    const res: any = await getEnumModelPageList({
      ...unref(form),
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });

    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  }

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const onAdd = async (record?, isSystem = false) => {
    const res = await gct.openUtil.drawer(
      addModal,
      {
        data: record || {},
        isSystem,
      },
      {
        title: record ? '编辑' : '新建',
        width: 640,
        height: '100%',
        showFooter: true,
      },
    );
    if (res.ok) {
      if (!isSystem) message.success(record ? '编辑成功' : '新建成功');
      getTableData(1);
    }
  };

  async function onDelete(record) {
    await deleteEnumModel({
      ids: record.id,
    });
    message.success('删除成功');
    getTableData(1);
  }
</script>
<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
