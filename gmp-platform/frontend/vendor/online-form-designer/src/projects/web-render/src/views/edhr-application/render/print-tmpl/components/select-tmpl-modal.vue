<template>
  <div class="p16px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="我的常用">
        <base-vxe-table
          class="h400px"
          :tableColumns="tableColumns"
          :data-source="tableData"
          :loading="loading"
          :action="{ width: 100 }"
          :showPagination="false"
          :attributes="{
            'radio-config': {
              highlight: true,
            },
            'row-config': {
              isCurrent: false,
            },
          }"
          :events="{
            'radio-change': onRadioChange,
          }"
        >
          <template #custom_item="{ column: { field }, record }">
            {{ formatSize(record) }}
          </template>
          <template #operate="{ row: record }">
            <table-action-auto
              :actions="[
                {
                  icon: 'iconfont:icon-chakan1',
                  onClick: () => onView(record),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </base-vxe-table>
      </a-tab-pane>
      <a-tab-pane key="2" tab="全部">
        <SearchForm
          :formData="formState"
          :initData="initSearchList"
          :rowLength="2"
          @on-query="getTableDataAll(1)"
        />
        <base-vxe-table
          class="h320px"
          :tableColumns="tableColumns"
          :data-source="tableDataAll"
          :loading="loadingAll"
          :action="{ width: 100 }"
          :attributes="{
            'radio-config': {
              highlight: true,
            },
            'row-config': {
              isCurrent: false,
            },
          }"
          :events="{
            'radio-change': onRadioChange,
          }"
          showPagination
          v-model:pagination="pagination"
          @request-table-data="handleTableChange"
        >
          <template #custom_item="{ column: { field }, record }">
            {{ formatSize(record) }}
          </template>
          <template #operate="{ row: record }">
            <table-action-auto
              :actions="[
                {
                  icon: 'iconfont:icon-chakan1',
                  onClick: () => onView(record),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </base-vxe-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue';
  import BaseVxeTable from '../../../components/base-vxe-table/index.vue';
  import SearchForm from '../../../components/search-form/index.vue';
  import { message, TablePaginationConfig } from 'ant-design-vue';
  import { pagerSizeMap } from '/@/projects/app-designer/src/views/print-designer-new/constants';
  import { TableActionAuto } from '/@/components/Table';
  import ViewTmplModal from './view-tmpl-modal.vue';
  import { IModal, useModal } from '@gct/runtime';
  import {
    getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getDocumentPageList } from '/@/apis/gct-apaas/DocumentController';

  defineProps<{
    modal: IModal;
  }>();

  const activeKey = ref('1');
  const tableData = ref([]);
  const tableDataAll = ref([]);
  const loading = ref(false);
  const loadingAll = ref(false);
  const tableColumns = [
    { type: 'radio', width: 50 },
    {
      title: $t('sys.pageDesigner.name'),
      field: 'name',
    },
    {
      title: '尺寸类型',
      field: 'pagerSize',
      width: 150,
      slots: { default: 'custom_render' },
    },
  ];
  const formState = reactive({});
  const selectedRow = ref();

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.pageDesigner.name'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
  ];

  onMounted(() => {
    getCommonTableData();
    getTableDataAll();
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableDataAll();
  };

  async function getTableDataAll(pageNo?) {
    loadingAll.value = true;
    try {
      const res: any = await getDocumentPageList({
        ...formState,
        pageNo: pageNo || pagination.current,
        pageSize: pagination.pageSize,
      });
      tableDataAll.value = res.data || [];
      pagination.total = res.totalCount;
      loadingAll.value = false;
    } catch (error) {
      loadingAll.value = false;
    }
  }

  async function getCommonTableData() {
    loading.value = true;
    try {
      const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_my_print_tmpl',
          bsKey: 'biz_my_list',
        },
        {},
      );
      tableData.value = (res || []).map((item) => {
        return {
          ...item,
          ...item.doc_info_,
        };
      });
      if (!tableData.value.length) {
        activeKey.value = '2';
      }
      loading.value = false;
    } catch (error) {
      loading.value = false;
    }
  }

  const onView = (record) => {
    gct.openUtil.drawer(
      ViewTmplModal,
      {
        id: record.id,
      },
      {
        title: $t('sys.edhr.viewTemplate'),
        showFooter: false,
        width: 900,
        class: 'gct-view-tmpl-modal',
      },
    );
  };

  const onRadioChange = ({ row }) => {
    console.log('change', row);
    selectedRow.value = row;
  };

  function formatSize(record) {
    return `${record.paperSize ? pagerSizeMap[record.paperSize] : ''}(${record.height || ''}*${
      record.width || ''
    })`;
  }

  async function insertOneCommmon() {
    if (!tableData.value.some((e) => e.id === selectedRow.value.id)) {
      await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_my_print_tmpl',
          bsKey: 'biz_refresh',
        },
        {
          print_tmpl_id_: selectedRow.value.id,
        },
      );
    }
  }

  useModal(() => {
    if (!selectedRow.value) {
      message.warn('请选择模板');
      return {
        ok: false,
      };
    }
    insertOneCommmon();
    return {
      ok: true,
      data: selectedRow.value,
    };
  });
</script>
<style lang="less" scoped>
  :deep(.icon-chakan1) {
    font-size: 18px;
    line-height: 1;
  }
</style>
<style lang="less">
  .gct-view-tmpl-modal {
    .scrollbar__view {
      height: 100%;
    }

    .ant-drawer-body {
      padding: 0;
    }
  }
</style>
