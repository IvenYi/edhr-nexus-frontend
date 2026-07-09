<template>
  <div class="h-full">
    <div class="h-full flex flex-col">
      <div class="flex-none flex">
        <div class="flex items-center w-300px">
          <a-input
            :placeholder="t('sys.integration.searchConnNameOrBrandOrVer')"
            v-model:value="searchValue"
            @keydown.enter="handleEnter"
          />
        </div>

        <div class="ml-[auto]">
          <a-button v-if="userActions.Import" @click="handleImport" class="mr-8px">
            {{ t('sys.import') }}
          </a-button>
          <a-button v-if="userActions.AddConnector" type="primary" @click="handleNew">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.new') }}
          </a-button>
        </div>
      </div>

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

        <div v-if="false" class="ml-[auto]">
          <a-button @click="handleImport" class="mr-8px">
            {{ t('sys.import') }}
          </a-button>
          <a-button type="primary" @click="handleNew">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.new') }}
          </a-button>
        </div>
      </div>

      <a-table
        class="flex-1 h-100px mt-16px"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: handleSelectChange }"
        row-key="id"
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
        size="middle"
        ref="tableContainerRef"
        :scroll="{
          y: scrollHeight,
          x: 1500,
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <table-action-auto
              :maxDispalyCount="5"
              :actions="[
                {
                  ifShow: userActions.Config,
                  label: t('sys.config'),
                  onClick: () => handleDesign(record),
                },
                {
                  ifShow: userActions.Edit,
                  label: t('sys.edit'),
                  onClick: () => handleEdit(record),
                },
                {
                  ifShow: !record.connectCount && userActions.Delete,
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDelete'),
                    confirm: () => handleDelete(record),
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
  import { ref, reactive, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { message } from 'ant-design-vue';
  import { getAuthTestConnectOnce } from '/@/apis/gct-ipaas2/AuthController';
  import type { FlowAppResponse } from '/@/apis/gct-ipaas2/model';
  import { getController } from './connector-designer';
  import ConnectorModal from './connector-modal.vue';
  import { deleteFlowApp, getFlowAppPageList } from '/@/apis/gct-ipaas2/FlowAppController';
  import { debounce } from 'lodash-es';
  import {
    postConnectorConfigExport,
    postConnectorConfigImport,
  } from '/@/apis/gct-ipaas2/ConnectorConfigController';
  import { downloadByData, uploaderFiles } from '/@/utils/file/download';

  type Key = string | number;

  const selectedRowKeys = ref<Key[]>([]);
  /**
   * 选中
   */
  const handleSelectChange = (keys: Key[]) => {
    selectedRowKeys.value = keys;
  };
  const resetSelectedRowKeys = () => {
    selectedRowKeys.value = [];
  };

  const props = withDefaults(
    defineProps<{
      categoryId?: string;
      userActions: { [key: string]: boolean };
    }>(),
    {},
  );

  const c = getController();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const { t } = useI18n();
  const searchValue = ref('');
  const loading = ref<boolean>(false);
  const tableData = ref<FlowAppResponse[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await getFlowAppPageList({
      pageNo,
      pageSize: pagination.pageSize,
      categoryId: props.categoryId!,
      keyword: searchValue.value,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
    // 查询时重置选中
    resetSelectedRowKeys();
    // setTimeout(() => {
    //   scrollHeight.value = undefined;
    // }, 1000);
  };

  watch(
    () => props.categoryId,
    (val) => {
      if (val) {
        getTableData();
      }
    },
    { immediate: true },
  );

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.ipaas.connectorName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.ipaas.appBrand'),
      dataIndex: 'brand',
      key: 'brand',
      ellipsis: true,
    },
    {
      title: t('sys.appDesigner.version'),
      dataIndex: 'version',
      key: 'version',
      ellipsis: true,
    },
    // {
    //   title: t('sys.ipaas.connectCount'),
    //   dataIndex: 'connectCount',
    //   key: 'connectCount',
    // },
    {
      title: t('sys.developer.appCenter.description'),
      dataIndex: 'description',
      key: 'description',
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
      width: 150,
      fixed: 'right',
    },
  ];

  /**
   * 新增
   */
  const handleNew = async () => {
    const res = await gct.openUtil.modal(
      ConnectorModal,
      {
        isEdit: false,
        data: {
          categoryId: props.categoryId,
        },
      },
      {
        title: t('sys.newSth', { sth: t('sys.ipaas.connector') }),
        width: 800,
      },
    );
    if (res.ok) {
      getTableData();
    }
  };

  const handleEnter = debounce(() => {
    getTableData(1);
  }, 300);

  /**
   * 编辑
   */
  const handleEdit = async (record: FlowAppResponse) => {
    const res = await gct.openUtil.modal(
      ConnectorModal,
      {
        isEdit: true,
        data: record,
      },
      {
        title: t('sys.editSth', { sth: t('sys.ipaas.connector') }),
        width: 800,
      },
    );
    if (res.ok) {
      getTableData();
    }
  };

  const handleDesign = async (record) => {
    const needRefresh = await c.design(record);
    console.log('needRefresh', needRefresh);
    if (needRefresh) {
      getTableData();
    }
  };

  /**
   * 删除
   */
  const handleDelete = async (record: FlowAppResponse) => {
    await deleteFlowApp({
      ids: record.id!,
    });
    message.success(t('sys.delSuccess'));
    getTableData(1);
  };

  /**
   * 导入
   */
  const handleImport = async () => {
    console.log('导入');
    if (!props.categoryId) {
      message.warning(t('sys.pleaseSelectCategory'));
      return;
    }
    const [file] = await uploaderFiles({ accept: '.json' });
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    await postConnectorConfigImport(
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

  /**
   * 导出
   */
  const handleExport = async () => {
    const keys = selectedRowKeys.value as string[];
    try {
      const fileStream: any = await postConnectorConfigExport(keys, {
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
          filename: t('sys.integration.exportConnector'),
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
</script>

<style lang="less" scoped>
  // 空数据的时候不显示任何滚动条
  :deep(.ant-table-empty) {
    table {
      overflow: hidden;
    }
  }
</style>
