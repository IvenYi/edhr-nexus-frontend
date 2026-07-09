<template>
  <div class="approval-process-choice">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="t('sys.edhr.myCommonUsage')">
        <base-vxe-table
          ref="tableRef"
          class="h-100%"
          height="400"
          :tableColumns="columns"
          :data-source="tableData"
          :loading="loading"
          :showPagination="false"
          :attributes="{
            'radio-config': {
              highlight: true,
            },
          }"
        >
          <template #operate="{ row }">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.view'),
                  onClick: () => onOpenBizFlowPathModal(row),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </base-vxe-table>
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('sys.all')">
        <search-form
          :formData="formState"
          :initData="initSearchList"
          :rowLength="2"
          @on-query="getTableDataAll(1)"
        />
        <base-vxe-table
          ref="tableAllRef"
          class="h-100%"
          height="400"
          :tableColumns="allColumns"
          :data-source="tableDataAll"
          :loading="loading"
          showPagination
          v-model:pagination="pagination"
          @request-table-data="handleTableChange"
        >
          <template #operate="{ row }">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.view'),
                  onClick: () => onOpenBizFlowPathModal(row),
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

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BaseVxeTable from '/@/projects/web-render/src/views/edhr-application/components/base-vxe-table/index.vue';
  import { message, TablePaginationConfig } from 'ant-design-vue';
  import { IModal, useModal } from '@gct/runtime';
  import { TableActionAuto } from '/@/components/Table';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getPmProcessDefinitionPageList } from '/@/apis/gct-apaas/PmProcessDefinitionController';
  import { Design as ApprovalDesignModal } from '/@/projects/web-render/src/views/edhr-application/components/approval-process-temp/index.ts';
  import SearchForm from '/@/projects/web-render/src/views/edhr-application/components/search-form/index.vue';

  const props = defineProps<{
    modal: IModal;
    processType: string;
  }>();

  const { t } = useI18n();

  const initSearchList = [
    {
      type: 'input',
      label: t('sys.name'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
  ];

  const columns = [
    { field: 'radio', type: 'radio', minWidth: 40 },
    { title: t('sys.name'), field: 'approve_tmpl_name_', minWidth: 250 },
    {
      title: t('sys.description'),
      field: 'approve_tmpl_description_',
      minWidth: 150,
    },
  ];
  const allColumns = [
    { type: 'radio', width: 50 },
    {
      title: t('sys.name'),
      field: 'name',
    },
    {
      title: t('sys.description'),
      field: 'description',
    },
  ];
  const processTypeMap = {
    SUMMARY: '__summary_process__',
    CHANGE: '__change_process__',
    PRODUCT_PROCESS: '__product_process_process__',
    ROUTING: '__routing_process__',
  };

  const tableRef = ref();
  const tableAllRef = ref();
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const activeKey = ref('1');
  const loading = ref(false);
  const tableData = ref([]);
  const tableDataAll = ref([]);

  const formState = reactive({
    name: undefined,
  });

  async function getTableDataAll(pageNo?) {
    try {
      const res: any = await getPmProcessDefinitionPageList({
        query: formState.name,
        pageNo: pageNo || pagination.current,
        pageSize: pagination.pageSize,
        categoryId: processTypeMap[props.processType],
      });
      pagination.total = res.totalCount;
      pagination.current = res?.pageNo ?? 1;
      pagination.total = res?.totalCount ?? 0;
      tableDataAll.value = res.data || [];
    } catch (error) {
      loading.value = false;
    }
  }

  async function getCommonTableData() {
    try {
      loading.value = true;
      const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_edhr_summary_approve_common_use',
          bsKey: 'biz_search',
        },
        {
          type_: props.processType!,
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

  function handleTableChange(paginationInfo) {
    Object.assign(pagination, paginationInfo);
    getTableDataAll();
  }

  function onOpenBizFlowPathModal(record) {
    const payload = {
      id: record.approve_tmpl_id_ || record.id,
      detailMode: true,
      name: record.approve_tmpl_name_ || record.name,
    };
    gct.openUtil.fullScreen(ApprovalDesignModal, { ...payload });
  }

  async function onSubmit() {
    const table =
      activeKey.value === '1' ? await tableRef.value?.getRef() : await tableAllRef.value?.getRef();
    const selectData = table.getRadioRecord();

    if (!selectData) {
      message.warn(t('sys.pleaseSelectSth', { sth: t('sys.appDesigner.template') }));
      return {
        ok: false,
      };
    }

    return {
      ok: true,
      data: {
        ...selectData,
        approveTmplId: selectData.approve_tmpl_id_ || selectData.id,
      },
    };
  }

  onMounted(() => {
    getTableDataAll();
    getCommonTableData();
  });

  useModal(onSubmit);
</script>

<style lang="less" scoped>
  .approval-process-choice {
    padding: 16px;

    :deep(.ant-form-item-control-input-content) {
      flex: 1 !important;
    }

    :deep(.ant-radio-group) {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
    }

    :deep(.ant-picker) {
      flex: 1 !important;
    }
  }
</style>
