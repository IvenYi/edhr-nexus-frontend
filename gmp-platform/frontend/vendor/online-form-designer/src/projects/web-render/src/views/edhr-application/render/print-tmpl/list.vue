<template>
  <basic-page-render>
    <div class="p16px h100% overflow-hidden ks-column">
      <SearchForm :formData="formState" :initData="initSearchList" @on-query="getTableData(1)" />
      <div class="mb12px text-right">
        <a-button v-if="!!printTmplUsePerms.Insert" type="primary" @click="onAdd(null, true)">
          {{ '新建' }}
        </a-button>
      </div>
      <base-vxe-table
        class="flex-1"
        :tableColumns="tableColumns"
        :data-source="tableData"
        :loading="loading"
        :action="{ width: 200 }"
        showPagination
        v-model:pagination="pagination"
        @request-table-data="handleTableChange"
      >
        <template #custom_item="{ column: { field }, record }">
          {{ pagerSizeMap[record.paperSize] }}
        </template>
        <template #operate="{ row: record }">
          <table-action-auto
            :maxDispalyCount="3"
            :actions="[
              {
                ifShow: () => !!printTmplUsePerms.Design,
                label: $t('sys.design'),
                onClick: () => onDesign(record),
              },
              {
                ifShow: () => !!printTmplUsePerms.Update,
                label: $t('sys.edit'),
                onClick: () => onAdd(record, false),
              },
              {
                ifShow: () => !!printTmplUsePerms.Delete,
                label: $t('sys.delete'),
                color: 'error',
                onClick: () => onDelete(record.id),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </base-vxe-table>
    </div>
  </basic-page-render>
</template>
<script setup lang="tsx" name="print-tmpl-list">
  import { onMounted, reactive, ref } from 'vue';
  import SearchForm from '../../components/search-form/index.vue';
  import BaseVxeTable from '../../components/base-vxe-table/index.vue';
  import { message, Modal, TablePaginationConfig } from 'ant-design-vue';
  import AddModal from './components/add-modal.vue';
  import { TableActionAuto } from '/@/components/Table';
  import { genUrl, openWindow } from '/@/utils';
  import { useBranch } from '/@/hooks/develop/useBranch';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import {
    deleteDocumentRemoveVersionById,
    getDocumentPageList,
    getDocumentInfo,
  } from '/@/apis/gct-apaas/DocumentController';
  import { pagerSizeMap } from '/@/projects/app-designer/src/views/print-designer-new/constants';
  import PrintDetailDrawer from './components/print-detail-drawer.vue';
  import { usePagePermissions } from '../../hooks/usePagePermissions';

  const { branchId } = useBranch();
  const usePathQuery = usePathQueryStore();

  const tableData = ref([]);
  const loading = ref(false);
  const formState = reactive({});
  const { getEnv } = useEnv();

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const printTmplUsePerms = usePagePermissions('print-tmpl');

  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.pageDesigner.name'),
      id: 'name',
      model: 'name',
      maxLength: 32,
    },
    {
      type: 'select',
      label: $t('sys.sizeType'),
      id: 'paperSize',
      model: 'paperSize',
      options: Object.keys(pagerSizeMap).map((key) => {
        return { value: key, label: pagerSizeMap[key] };
      }),
    },
    {
      type: 'userSelect',
      label: $t('sys.creator'),
      id: 'createUserId',
      model: 'createUserId',
    },
    {
      type: 'userSelect',
      label: $t('sys.updatePerson'),
      id: 'modifyUserId',
      model: 'modifyUserId',
    },
  ];

  const tableColumns = [
    {
      title: $t('sys.pageDesigner.name'),
      field: 'name',
      minWidth: 220,
      showOverflow: 'tooltip',
      slots: {
        default({ row }) {
          return (
            <a href="javascript:;" onClick={() => onViewDetail(row.id!)}>
              {row.name}
            </a>
          );
        },
      },
    },
    {
      title: '描述',
      field: 'description',
      minWidth: 220,
    },
    { title: '尺寸类型', field: 'paperSize', minWidth: 120, slots: { default: 'custom_render' } },
    { title: '高度(mm)', field: 'height', minWidth: 120 },
    { title: '宽度(mm)', field: 'width', minWidth: 120 },
    { title: '创建人', field: 'createUserName', minWidth: 140 },
    { title: '创建时间', field: 'createTime', width: 170 },
    { title: '更新人', field: 'modifyUserName', minWidth: 140 },
    { title: '更新时间', field: 'modifyTime', width: 170 },
  ];

  onMounted(() => {
    getTableData();
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  async function getTableData(pageNo?) {
    loading.value = true;
    try {
      const res: any = await getDocumentPageList({
        ...formState,
        pageNo: pageNo || pagination.current,
        pageSize: pagination.pageSize,
      });
      tableData.value = res.data || [];
      pagination.total = res.totalCount;
      loading.value = false;
    } catch (error) {
      loading.value = false;
    }
  }

  const onAdd = async (row?, showOk2Open?) => {
    const res = await gct.openUtil.modal(
      AddModal,
      {
        isEdit: !!row,
        id: row?.id,
        showOk2Open: !!showOk2Open,
      },
      {
        title: !row ? $t('sys.new') : $t('sys.edit'),
        okText: $t('sys.okText'),
        width: 640,
        showFooter: false,
      },
    );

    if (res.ok) {
      await getTableData();
      // 新建后直接跳转设计页面
      if (!row && res.showOk2Open) {
        const rowData = tableData.value?.[0];
        onDesign(rowData);
      }
    }
  };

  const onDesign = (row) => {
    if (!row) return;
    openWindow(
      genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_FORM_DESIGNER}`, {
        aid: usePathQuery.getAid(),
        bid: branchId.value,
        id: row.id,
        env: getEnv(),
        model: row.model,
      }),
      {
        target: '_blank',
      },
    );
  };

  const onDelete = async (id) => {
    Modal.confirm({
      content: '确认执行？',
      okText: $t('sys.okText'),
      cancelText: $t('sys.cancel'),
      async onOk() {
        await deleteDocumentRemoveVersionById({ id });
        message.success($t('sys.delSuccess'));
        getTableData();
      },
      onCancel() {},
    });
  };
  const onViewDetail = async (id) => {
    const info = await getDocumentInfo({ id });
    if (!info) {
      throw new Error('没有数据');
    }
    const dataReactive = reactive(info);

    await gct.openUtil.drawer(
      PrintDetailDrawer,
      {
        data: dataReactive,
        showEdit: false,
      },
      {
        title: $t('sys.detail'),
        width: '70%',
        height: '100%',
        destroyOnClose: true,
      },
    );
  };
</script>
<style lang="less" scoped>
  :deep(.vben-basic-table-action) {
    .ant-btn.ant-btn-sm {
      padding: 0;
    }

    .ant-dropdown-trigger {
      margin-left: 5px;
    }
  }
</style>
