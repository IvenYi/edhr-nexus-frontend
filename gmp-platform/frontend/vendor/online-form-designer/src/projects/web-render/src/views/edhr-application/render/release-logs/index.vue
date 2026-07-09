<template>
  <basic-page-render>
    <div class="flex flex-col h-full p-16px">
      <search-form
        :formData="formState"
        :initData="initSearchList"
        @on-query="() => getTableData(1)"
      />

      <base-vxe-table
        class="h-100%"
        :tableColumns="columnDefinitions"
        :data-source="tableData"
        :loading="loading"
        showPagination
        :action="{ width: 100 }"
        v-model:pagination="pagination"
        @request-table-data="handleTableChange"
      >
        <template #operate="{ row }">
          <table-action-auto
            :actions="[
              {
                label: t('sys.detail'),
                onClick: () => handleView(row),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </base-vxe-table>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import { useApaasEbr, useInstanceStatus } from '/@online-form/views/integration/apaas_ebr/index';

  import {
    getProductReleasePageList,
    getProductReleasePageListQueryInterface,
  } from '/@/apis/gct-apaas/ProductReleaseController';
  import type { ProductReleaseResponse } from '/@/apis/gct-apaas/model';
  import SearchForm from '../../components/search-form/index.vue';

  const { t } = useI18n();

  const { getInstanceOptions } = useInstanceStatus();

  const columnDefinitions = [
    { title: t('sys.edhr.lotOrSn'), field: 'materialNo', minWidth: 250 },
    { title: t('sys.material'), field: 'productName', minWidth: 300 },
    { title: t('sys.edhr.formTmpl'), field: 'ofTmplName', minWidth: 300 },
    {
      title: $t('sys.edhr.operatingState'),
      field: 'instanceStatus',
      minWidth: 140,
      slots: { default: 'work_status_render' },
    },
    { title: t('sys.updatePerson'), field: 'modifyUserName' },
    { title: t('sys.kit.edhr.releaseTime'), field: 'completedTime', minWidth: 176 },
    { title: t('sys.createUser'), field: 'createUserName' },
    { title: t('sys.createTime'), field: 'createTime', minWidth: 176 },
  ];

  const initSearchList = [
    {
      type: 'lotTableSelect',
      label: t('sys.edhr.lotOrSn'),
      id: 'materialNo',
      model: 'materialNo',
      selectAttrs: {
        ignoreArchived: false,
        variant: 'select',
        placeholder: '请选择',
      },
    },
    {
      type: 'select',
      label: $t('sys.edhr.operatingState'),
      id: 'instanceStatus',
      model: 'instanceStatus',
      options: getInstanceOptions({ type: 'release' }),
    },
    {
      type: 'treeTableSelect',
      label: $t('sys.material'),
      id: 'productId',
      model: 'productId',
      modelKey: 'em_product',
      parentToDefault: true,
      hideSingleVersion: false,
    },
    {
      type: 'userSelect',
      label: $t('sys.creator'),
      id: 'createUserId',
      model: 'createUserId',
    },
    {
      type: 'dateRange',
      label: t('sys.createTime'),
      startModel: 'startCreateTime',
      endModel: 'endCreateTime',
      format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      type: 'userSelect',
      label: t('sys.updatePerson'),
      id: 'modifyUserId',
      model: 'modifyUserId',
    },
    {
      type: 'dateRange',
      label: $t('sys.kit.edhr.releaseTime'),
      startModel: 'startCompletedTime',
      endModel: 'endCompletedTime',
    },
  ];

  const formState = reactive<getProductReleasePageListQueryInterface>({
    pageNo: undefined,
    pageSize: undefined,
    materialNo: undefined,
    instanceStatus: undefined,
    productId: undefined,
    createUserId: undefined,
    startCreateTime: undefined,
    endCreateTime: undefined,
    modifyUserId: undefined,
    startCompletedTime: undefined,
    endCompletedTime: undefined,
    sortField: undefined,
    sortType: undefined,
  });

  const loading = ref<boolean>(false);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const tableData = ref<ProductReleaseResponse[]>([]);

  const { openSingleDrawer } = useApaasEbr();

  const getTableData = async (initCurrent = 0) => {
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }
    loading.value = true;
    const res = await getProductReleasePageList({
      ...formState,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };

  onMounted(() => getTableData(1));

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const handleView = (record: ProductReleaseResponse) => {
    openSingleDrawer({
      selfId: record.ofInstId,
      materialNo: record.materialNo,
      keep: false,
      title: '放行记录详情',
      isViewPage: true,
    });
  };
</script>
