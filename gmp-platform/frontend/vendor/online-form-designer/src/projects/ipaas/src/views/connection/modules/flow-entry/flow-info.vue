<template>
  <div class="h-full ks-column">
    <a-row>
      <a-col :span="8">
        <a-input
          v-model:value="searchVal"
          allowClear
          :placeholder="$t('sys.integration.searchFlowNameOrKey')"
          @keydown.enter="handleEnter"
        />
      </a-col>
      <a-col :span="16" class="text-right">
        <a-button v-if="userActions.Import" @click="handleImport">{{ $t('sys.import') }}</a-button>
        <a-button v-if="userActions.AddIpaas" class="ml16px" type="primary" @click="onAdd()">
          <template #icon>
            <plus-outlined />
          </template>
          {{ $t('sys.new') }}
        </a-button>
      </a-col>
    </a-row>
    <div class="flex-none flex">
      <div v-if="selectedRowKeys.length > 0" class="flex items-center mt-16px">
        <div class="mr-24px mt-1px flex items-center">
          {{ t('sys.batchOperation.selected') }}
          <b class="primary-color ml-4px mr-4px">{{ selectedRowKeys.length }}</b>
          {{ t('sys.batchOperation.lines') }}
          <div
            class="h-16px w-16px border-rd-50% bg-[#E6E9EF] flex items-center justify-center ml-8px cursor-pointer"
            @click="selectedRowKeys = []"
          >
            <close-outlined class="text-12px color-[#797A7D] scale-80" />
          </div>
        </div>
        <a-button v-if="userActions.Export" type="primary" @click="handleExport">
          {{ t('sys.export') }}
        </a-button>
      </div>
    </div>
    <div class="ks-col overflow-hidden mt16px">
      <a-table
        class="flex-1 h100%"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: handleSelectChange }"
        ref="tableContainerRef"
        row-key="fuuid"
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :resizable="true"
        @change="handleTableChange"
        :loading="loading"
        size="middle"
        :scroll="{
          y: scrollHeight,
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="primary-gct cursor-pointer" @click="onDetail(record)">
              {{ record.name }}
            </span>
          </template>
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :maxDispalyCount="6"
              :actions="[
                {
                  ifShow: userActions.Edit,
                  label: $t('sys.edit'),
                  onClick: () => onAdd(record),
                },
                {
                  ifShow: userActions.Design,
                  label: $t('sys.design'),
                  onClick: () => onDesign(record),
                },
                // {
                //   ifShow: record.status == 0,
                //   label: $t('sys.enable'),
                //   popConfirm: {
                //     title: '你确定要启用吗？',
                //     confirm: () => onEnable(record),
                //   },
                // },
                // {
                //   ifShow: record.status == 1,
                //   label: $t('sys.disable'),
                //   popConfirm: {
                //     title: '你确定要禁用吗？',
                //     confirm: () => onDisabled(record),
                //   },
                // },
                {
                  ifShow: userActions.Delete,
                  label: $t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: $t('sys.sureToDoDelete'),
                    confirm: () => onDelete(record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, watch } from 'vue';
  import { useFlowEntry } from './useFlowEntry';
  import { openWindow, genUrl } from '/@/utils';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { message, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import flowDetailModal from './flow-detail-modal.vue';
  import FlowModal from './flow-modal.vue';
  import { debounce } from 'lodash-es';
  import { FlowMainResp } from '/@/apis/gct-ipaas2/model';
  import {
    getFlowPageList,
    postFlowExport,
    postFlowImport,
  } from '/@/apis/gct-ipaas2/FlowMainController';
  import { useI18n } from 'vue-i18n';
  import { downloadByData, uploaderFiles } from '/@/utils/file/download';
  import { deleteFlowByFuuid } from '/@/apis/gct-ipaas/IpaasDataFlowController';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useBranch } from '/@/hooks/develop/useBranch';
  import { useEnv } from '/@/hooks/develop/useEnv';

  const { t } = useI18n();
  const props = defineProps<{
    categoryId?: string;
    userActions: { [key: string]: boolean };
  }>();

  type Key = string | number;

  const selectedRowKeys = ref<Key[]>([]);
  const { getEnv } = useEnv();
  const usePathQuery = usePathQueryStore();
  const appTag = ref(usePathQuery.getAid());
  const { branchId } = useBranch();
  /**
   * 选中
   */
  const handleSelectChange = (keys: Key[]) => {
    selectedRowKeys.value = keys;
  };
  const resetSelectedRowKeys = () => {
    selectedRowKeys.value = [];
  };

  const searchVal = ref();
  const tableData = ref<Array<FlowMainResp>>([]);
  const loading = ref(false);
  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => $t('sys.component.table.total', { total }),
  });
  const columns: TableColumnsType = [
    {
      title: t('sys.integration.flowName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.integration.flowKey'),
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
    },
    // {
    //   title: '状态',
    //   dataIndex: 'statusStr',
    //   key: 'statusStr',
    //   ellipsis: true,
    //   width: 120,
    // },
    {
      title: t('sys.developer.appCenter.description'),
      dataIndex: 'mark',
      key: 'mark',
      ellipsis: true,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      ellipsis: true,
      width: 180,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      ellipsis: true,
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      align: 'left',
      fixed: 'right',
      width: 150,
    },
  ];

  watch(
    () => props.categoryId,
    () => {
      console.log('watch-cate', props.categoryId);
      if (!props.categoryId) return;
      pagination.current = 1;
      searchVal.value = '';
      getTableData();
    },
    {
      immediate: true,
    },
  );

  watch(searchVal.value, debounce(getTableData, 300));

  // 设计
  const onDesign = (record) => {
    openWindow(
      genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_CONNECTION_FLOW}`, {
        fuuid: record.fuuid,
        appTag: appTag.value,
        branchId: appTag.value ? branchId.value : '',
        env: appTag.value ? getEnv() : '',
      }),
      {
        target: '_blank',
      },
    );
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  async function getTableData(pageNum?) {
    loading.value = true;
    const res: any = await getFlowPageList({
      categoryId: props.categoryId!,
      pageNo: pageNum ?? pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchVal.value,
    }).finally(() => {
      loading.value = false;
    });
    tableData.value = res.data || [];
    pagination.total = res.totalCount;
    // 查询时重置选中
    resetSelectedRowKeys();
  }

  const onAdd = async (record?, isCopy?) => {
    const title = !record
      ? $t('sys.newSth', {
          sth: $t('sys.ipaas.connectionFlow'),
        })
      : isCopy
        ? $t('sys.integration.copyFlow')
        : $t('sys.editSth', {
            sth: $t('sys.ipaas.connectionFlow'),
          });
    const result = await gct.openUtil.modal(
      FlowModal,
      {
        isEdit: !!record,
        categoryId: props.categoryId,
        context: record ?? {},
      },
      {
        title,
        width: 640,
        showFooter: true,
        okText: $t('sys.okText'),
      },
    );
    if (result.ok) {
      getTableData();
    }
  };

  const onDetail = (record) => {
    gct.openUtil.modal(
      flowDetailModal,
      {
        data: { ...record, appTag: appTag.value, branchId: branchId.value },
        canDesign: props.userActions?.Design
      },
      {
        title: $t('sys.detail'),
        width: 800,
        footer: null,
      },
    );
  };

  const onEnable = (record) => {
    console.log('onEnable', record);
  };

  const onDisabled = (record) => {
    console.log('onDisabled', record);
  };

  const onDelete = async (record) => {
    await deleteFlowByFuuid({ fuuid: record.fuuid });
    message.success(t('sys.delSuccess'));
    getTableData(1);
  };

  /**
   * 导出
   */
  const handleExport = async () => {
    const keys = selectedRowKeys.value as string[];
    try {
      const fileStream: any = await postFlowExport(keys, {
        isTransformResponse: false,
        transferToConfig: {
          responseType: 'blob',
          responseEncoding: 'utf8',
        },
      });
      if (fileStream.type === 'application/json') {
        // 返回json的时候是错误信息
        const json = await new Response(fileStream).json();
        message.error(json.subMessage);
      } else {
        console.log('导出', keys, fileStream);
        downloadByData(fileStream, {
          filename: t('sys.integration.exportFlow'),
          timestamp: false,
          mime: 'application/json',
        });
        message.success(t('sys.doSuccess'));
        getTableData(1);
      }
    } catch (error) {
      console.log('导出失败', error);
    }
  };

  /**
   * 导入
   */
  const handleImport = async () => {
    if (!props.categoryId) {
      message.warning(t('sys.pleaseSelectCategory'));
      return;
    }
    console.log('导入');
    const [file] = await uploaderFiles({ accept: '.json' });
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    await postFlowImport(
      formData,
      { categoryId: props.categoryId! },
      {
        transferToConfig: {
          headers: {
            'Content-Type': 'multipart/form-data;charset=UTF-8',
          },
        },
      },
    );
    message.success(t('sys.doSuccess'));
    getTableData(1);
  };

  const handleEnter = debounce(() => {
    getTableData(1);
  }, 300);
</script>

<style lang="less" scoped>
  .ant-tabs {
    height: 100%;

    :deep(> .ant-tabs-content-holder > .ant-tabs-content) {
      height: 100%;
    }

    :deep(> .ant-tabs-nav) {
      margin-bottom: 0;
    }

    :deep(.ant-tabs-content) {
      border-right: 1px solid @gct-input-border-color;
      border-bottom: 1px solid @gct-input-border-color;
      border-left: 1px solid @gct-input-border-color;
    }
  }
</style>
