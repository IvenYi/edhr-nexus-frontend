<template>
  <div class="p16px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="$t('sys.edhr.myCommonUsage')">
        <base-vxe-table
          class="h400px"
          :tableColumns="columns"
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
          <template #operate="{ row: record }">
            <table-action-auto
              :actions="[
                {
                  label: $t('sys.view'),
                  onClick: () => onView(record),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </base-vxe-table>
      </a-tab-pane>
      <a-tab-pane key="2" :tab="$t('sys.all')">
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
          <template #operate="{ row: record }">
            <table-action-auto
              :actions="[
                {
                  label: $t('sys.view'),
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
  import SearchForm from '/@web-render/views/edhr-application/components/search-form/index.vue';
  import BaseVxeTable from '/@web-render/views/edhr-application/components/base-vxe-table/index.vue';
  import { message, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { IModal, useModal } from '@gct/runtime';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getPmProcessDefinitionPageList } from '/@/apis/gct-apaas/PmProcessDefinitionController';
  import { openDesignModal } from '../../index';

  const props = defineProps<{
    modal: IModal;
    categoryId?: '__summary_process__' | '__change_process__';
  }>();

  const activeKey = ref('1');
  const tableData = ref([]);
  const tableDataAll = ref([]);
  const loading = ref(false);
  const loadingAll = ref(false);
  const columns = [
    { type: 'radio', width: 50 },
    {
      title: $t('sys.process.name'),
      field: 'approve_tmpl_name_',
    },
    {
      title: $t('sys.edhr.processDesc'),
      field: 'approve_tmpl_description_',
    },
  ];
  const tableColumns = [
    { type: 'radio', width: 50 },
    {
      title: $t('sys.process.name'),
      field: 'name',
    },
    {
      title: $t('sys.edhr.processDesc'),
      field: 'description',
    },
  ];
  const formState = reactive<any>({});
  const selectedRow = ref();

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.process.name'),
      id: 'name',
      model: 'name',
      maxLength: 64,
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
      const res: any = await getPmProcessDefinitionPageList({
        query: formState.name,
        pageNo: pageNo || pagination.current,
        pageSize: pagination.pageSize,
        categoryId: props.categoryId || '__summary_process__',
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
      const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_edhr_summary_approve_common_use',
          bsKey: 'biz_search',
        },
        {
          type_: props.categoryId === '__change_process__' ? 'CHANGE' : 'SUMMARY',
        },
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
    openDesignModal({
      id: record.approve_tmpl_id_ || record.id,
      detailMode: true,
      name: record.approve_tmpl_name_ || record.name,
    });
  };

  const onRadioChange = ({ row }) => {
    console.log('change', row);
    selectedRow.value = row;
  };

  useModal(() => {
    if (!selectedRow.value) {
      message.warn($t('sys.chooseTextTip', { name: $t('sys.appDesigner.template') }));
      return {
        ok: false,
      };
    }
    const { approve_tmpl_id_, id } = selectedRow.value;
    return {
      ok: true,
      data: {
        id: activeKey.value === '1' ? approve_tmpl_id_ : id,
      },
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
