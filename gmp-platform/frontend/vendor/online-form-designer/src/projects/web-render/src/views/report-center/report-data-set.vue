<template>
  <basic-page-render>
    <div class="p16px h100%" v-show="!isPreview">
      <div class="table-wrap empty" v-if="tableData && !tableData.length && !loading.value">
        <van-empty :image="emptyPng" :description="$t('sys.report.noDataSetTip')" />
        <a-button v-if="userActions.Insert" class="mr-16px" type="primary" @click="createDataSet">
          {{ t('sys.report.dataSet.new') }}
        </a-button>
      </div>
      <BasicTable
        v-if="tableData && tableData.length && !loading.value"
        :dataSource="tableData"
        :columns="columns"
        :striped="false"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #headerTop>
          <div class="flex">
            <a-button
              v-if="userActions.Insert"
              style="margin-left: auto"
              type="primary"
              @click="createDataSet"
            >
              {{ t('sys.report.dataSet.new') }}
            </a-button>
          </div>
        </template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'name'">
            <a @click="dataSetPreview(record)">
              {{ record.name }}
            </a>
          </template>
          <template v-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  ifShow: userActions.Update,
                  onClick: handleRowEdit.bind(null, record),
                },

                {
                  label: t('sys.delete'),
                  color: 'text',
                  ifShow: userActions.Delete && !record.publish,
                  popConfirm: {
                    title: t('sys.confirmExecution'),
                    confirm: handleRowDelete.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </BasicTable>
    </div>
    <ReportDataSetPreview
      v-if="isPreview"
      :key="previewRow.id"
      :id="previewRow.id"
      @back="previewBack"
    />
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { openReportDataSetDesign, ReportDataSetPreview } from '@gct/runtime-web';
  import {
    deleteReportDataSet,
    getReportDataSetPageList,
  } from '/@/apis/gct-apaas/ReportDataSetController';
  import { message } from 'ant-design-vue';
  import emptyPng from '/@/assets/images/empty.png';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { usePagePermissions } from '/@web-render/views/edhr-application/hooks/usePagePermissions';

  const appInfoStore = useAppInfoStore();

  const { t } = useI18n();
  const loading = ref(false);
  const tableData = ref([]);
  // 是否正在预览
  const isPreview = ref(false);
  // 当前预览的数据
  const previewRow = ref({});

  const detailRef = ref();

  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  const userActions = computed(() => {
    const page = 'ReportDataSet';

    if (inEDHRApp.value) {
      const perms = usePagePermissions(page);
      return perms.value;
    }

    return {
      Insert: !!getPermissionByKey(page, 'Insert'),
      Update: !!getPermissionByKey(page, 'Update'),
      Delete: !!getPermissionByKey(page, 'Delete'),
    };
  });
  console.log(userActions.value);
  const columns = [
    {
      title: t('sys.report.dataSet.name'),
      key: 'name',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
    },
    {
      title: t('sys.description'),
      key: 'description',
      dataIndex: 'description',
    },

    {
      title: t('sys.creator'),
      key: 'createUserName',
      dataIndex: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      key: 'createTime',
      dataIndex: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.modifier'),
      key: 'modifyUserName',
      dataIndex: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      key: 'modifyTime',
      dataIndex: 'modifyTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: 150,
      fixed: 'right',
    },
  ];

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    pageSizeOptions: ['10', '20', '50', '100'],
    total: 1,
  });
  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current || pagination.current;
    pagination.total = total || pagination.total;
    pagination.pageSize = pageSize || pagination.pageSize;
    getTableData();
  };

  const getTableData = () => {
    loading.value = true;
    getReportDataSetPageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    })
      .then((res) => {
        tableData.value = res?.data || [];
        pagination.total = res?.totalCount || 0;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  /** 删除行数据 */
  const handleRowDelete = (record) => {
    deleteReportDataSet({ ids: record.id }).then(() => {
      message.success(t('sys.deleteSuccess'));
      getTableData();
    });
  };

  /** 编辑行数据 */
  const handleRowEdit = async (record) => {
    const res = await openReportDataSetDesign(record.id);
    // if (res && res.ok) {
    getTableData();
    // }
  };

  const toDetail = (record) => {
    detailRef.value.open = true;
  };

  /** 新建数据集 */
  const createDataSet = async () => {
    const res = await openReportDataSetDesign();
    // if (res && res.ok) {
    getTableData();
    // }
    // openReportDataSetDesign;
  };

  const dataSetPreview = async (row) => {
    isPreview.value = true;
    previewRow.value = row;
  };

  const previewBack = () => {
    isPreview.value = false;
    previewRow.value = {};
  };

  function onInit(): void {
    getTableData();
  }

  onInit();
</script>
<style lang="scss" scoped>
  .table-wrap {
    width: 100%;
    height: 100%;
    padding: 16px;
    overflow: hidden;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  :deep(.van-empty__description) {
    margin-top: 4px;
    color: #8f8f8f;
  }
</style>
