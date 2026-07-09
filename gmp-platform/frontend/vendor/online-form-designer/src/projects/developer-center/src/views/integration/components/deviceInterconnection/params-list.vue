<template>
  <div>
    <div class="flex items-center text-[#8B8B8B] mb8px">
      <img :src="alertInfo" alt="" class="mr8px" />
      {{ t('sys.integration.deviceParamListTip') }}
    </div>
    <BasicTable
      ref="BasicTableRef"
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :columns="columns"
      :dataSource="tableData"
      :pagination="pagination"
      @change="handleTableChange"
      :rowSelection="rowSelection"
      :emptyFull="true"
      rowKey="id"
    >
      <template #headerTop>
        <div class="flex justify-between mb8px">
          <a-input
            v-model:value="searchKey"
            style="width: 300px"
            :placeholder="t('sys.integration.inputParamCodeOrName')"
            @pressEnter="getTableData()"
          >
            <template #prefix>
              <i class="gct-iconfont icon-search1"></i>
            </template>
          </a-input>
          <div class="flex">
            <a-upload
              v-if="userActions.ImportParams"
              :file-list="fileList"
              accept=".json"
              :max-count="1"
              :beforeUpload="handleBeforeUpload"
              :customRequest="handleCustomRequest"
              :showUploadList="false"
            >
              <a-button>{{ t('sys.import') }}</a-button>
            </a-upload>
            <a-button v-if="userActions.AddParams" type="primary" class="ml12px" @click="handleCreate">
              <i class="gct-iconfont icon-a-btn_add2 mr4px"></i>
              {{ t('sys.new') }}
            </a-button>
          </div>
        </div>
        <div
          v-if="allSelectedRowKeys && allSelectedRowKeys.length"
          class="flex mb8px items-center mt12px"
        >
          <div class="mr12px flex items-center">
            {{ t('sys.selected') }}
            <span class="select"> &nbsp;{{ allSelectedRowKeys.length }} &nbsp;</span> 行
            <span class="delete ml8px" @click="deleteSelect">
              <i class="gct-iconfont icon-del_pic"></i>
            </span>
          </div>
          <a-button v-if="userActions.BatchExportParams" type="primary" @click="handleBatchExport">
            {{ t('sys.integration.batchExport') }}
          </a-button>
        </div>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          {{ t(typeEnum[record.type]) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.edit'),
                ifShow: record.tenantId !== null && userActions.EditParams,
                onClick: handleEdit.bind(null, record),
              },

              {
                label: t('sys.delete'),
                color: 'error',
                ifShow: record.tenantId !== null && userActions.DeleteParams,
                popConfirm: {
                  title: t('sys.confirmExecution'),
                  confirm: handleRowDelete.bind(null, record),
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
        <template v-else>{{ record[column.key] || '--' }}</template>
      </template>
    </BasicTable>
    <CreateParams @register="register" @ok="getTableData" />
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, onMounted, computed, watch } from 'vue';
  import alertInfo from '/@/assets/svg/icon-alert-info.svg';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import type { TableRowSelection } from 'ant-design-vue/lib/table/interface';
  import {
    deleteDeviceInterconnectionParam,
    getDeviceInterconnectionParamPageList,
    postDeviceInterconnectionParamExport,
    postDeviceInterconnectionParamImport,
  } from '/@/apis/gct-platform/DeviceInterconnectionParamController';
  import { message, UploadFile } from 'ant-design-vue';
  import CreateParams from '../modal/create-params.vue';
  import { useModal } from '/@/components/Modal';
  import { downloadByData } from '/@/utils/file/download';
  import { typeEnum } from '../../enum';

  defineProps<{
    userActions: { [key: string]: boolean };
  }>();

  const { t } = useI18n();

  const [register, { openModal }] = useModal();

  const columns = [
    {
      title: t('sys.platform.code'),
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: t('sys.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('sys.errorLog.tableColumnType'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('sys.notes'),
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: t('sys.operation'),
      width: 200,
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const tableData = ref<Array<any>>([]);

  const BasicTableRef = ref();

  const fileList = ref();

  // 关键：存储所有选中的行key（跨页）
  const allSelectedRowKeys = ref<string[]>([]);
  // 存储所有选中的完整数据（跨页）
  const allSelectedRowsMap = ref<Map<string, any>>(new Map());

  const searchKey = ref();

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  // 行选择配置 - 关键实现跨页选择
  const rowSelection = computed<TableRowSelection>(() => {
    return {
      type: 'checkbox',
      fixed: true,
      selectedRowKeys: currentPageSelectedKeys.value,
      onChange: handleRowChange,
      onSelect: handleSelect,
      onSelectAll: handleSelectAll,
      getCheckboxProps: (record) => ({
        disabled: !record.tenantId, // Column configuration not to be checked
      }),
    };
  });

  // 当前页选中的key（用于rowSelection）
  const currentPageSelectedKeys = computed(() => {
    const currentPageKeys = tableData.value.filter((p) => p.tenantId).map((item) => item.id);
    // 返回在当前页且被选中的key
    return allSelectedRowKeys.value.filter((key) => currentPageKeys.includes(key));
  });

  // 处理单行选择/取消选择
  const handleSelect = (record: any, selected: boolean) => {
    const key = record.id;

    if (selected) {
      // 选中 - 添加到全局选中列表
      if (!allSelectedRowKeys.value.includes(key)) {
        allSelectedRowKeys.value.push(key);
        allSelectedRowsMap.value.set(key, record);
      }
    } else {
      // 取消选中 - 从全局选中列表移除
      const index = allSelectedRowKeys.value.indexOf(key);
      if (index > -1) {
        allSelectedRowKeys.value.splice(index, 1);
        allSelectedRowsMap.value.delete(key);
      }
    }
    BasicTableRef.value.redoHeight();
    console.log('当前选中keys:', allSelectedRowKeys.value);
  };

  // 处理全选/取消全选当前页
  const handleSelectAll = (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    const currentPageKeys = tableData.value.filter((p) => p.tenantId).map((item) => item.id);

    if (selected) {
      // 全选当前页
      currentPageKeys.forEach((key) => {
        if (!allSelectedRowKeys.value.includes(key)) {
          allSelectedRowKeys.value.push(key);
        }
      });

      // 更新选中的数据
      tableData.value.forEach((record) => {
        if (!allSelectedRowsMap.value.has(record.key)) {
          allSelectedRowsMap.value.set(record.id, record);
        }
      });
    } else {
      // 取消全选当前页
      allSelectedRowKeys.value = allSelectedRowKeys.value.filter(
        (key) => !currentPageKeys.includes(key),
      );

      // 移除当前页的数据
      currentPageKeys.forEach((key) => {
        allSelectedRowsMap.value.delete(key);
      });
    }

    console.log('全选后选中keys:', allSelectedRowKeys.value);
  };

  // 行选择变化处理（兼容原有逻辑）
  const handleRowChange = (selectedKeys: string[], selectedRowsData: any[]) => {
    // 这个事件通常由全选操作触发，但我们已经有onSelectAll处理了
    // 这里主要为了兼容性
    const currentPageKeys = tableData.value.map((item) => item.id);

    // 更新当前页的选中状态
    currentPageKeys.forEach((key) => {
      if (selectedKeys.includes(key) && !allSelectedRowKeys.value.includes(key)) {
        // 添加到全局选中
        allSelectedRowKeys.value.push(key);
        const record = tableData.value.find((item) => item.id === key);
        if (record) {
          allSelectedRowsMap.value.set(key, record);
        }
      } else if (!selectedKeys.includes(key) && allSelectedRowKeys.value.includes(key)) {
        // 从全局选中移除
        const index = allSelectedRowKeys.value.indexOf(key);
        if (index > -1) {
          allSelectedRowKeys.value.splice(index, 1);
          allSelectedRowsMap.value.delete(key);
        }
      }
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current || pagination.current;
    pagination.total = total || pagination.total;
    pagination.pageSize = pageSize || pagination.pageSize;
    getTableData();
  };

  const getTableData = () => {
    getDeviceInterconnectionParamPageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKey.value,
    }).then((res) => {
      tableData.value = res?.data || [];
      pagination.total = res?.totalCount || 0;
      if (res?.totalCount && !res?.data.length) {
        pagination.current -= 1;
        getTableData();
      }
    });
  };

  /** 删除行数据 */
  const handleRowDelete = (record) => {
    const index = allSelectedRowKeys.value.indexOf(record.id);
    if (index > -1) {
      allSelectedRowKeys.value.splice(index, 1);
      allSelectedRowsMap.value.delete(record.id);
    }
    deleteDeviceInterconnectionParam({ id: record.id }).then(() => {
      message.success(t('sys.deleteSuccess'));
      getTableData();
    });
  };

  const handleCreate = () => {
    openModal(true);
  };

  const handleEdit = (record) => {
    openModal(true, {
      ...record,
    });
  };

  /** 批量导出 */
  const handleBatchExport = async () => {
    const { data, headers } = await postDeviceInterconnectionParamExport(allSelectedRowKeys.value, {
      isTransformResponse: false,
      isReturnNativeResponse: true,
      transferToConfig: {
        responseType: 'blob',
        responseEncoding: 'utf8',
      },
    });
    if (data) {
      const attachment = new URLSearchParams(
        headers?.['content-disposition'].replace('attachment;', '') || '',
      );
      const filename = attachment.get('filename') || '';
      downloadByData(data, { filename });
    }
  };

  const deleteSelect = () => {
    allSelectedRowKeys.value = [];
    allSelectedRowsMap.value = new Map();
  };

  /** 上传前判断 */
  const handleBeforeUpload = (file: UploadFile) => {
    // 判断上传是否为json
    const fileType = ['application/json'];
    if (!fileType.includes(file.type)) {
      message.warning(`【${file.name}】支持的扩展名为.json`);
      return false;
    }
    return true;
  };

  const handleCustomRequest = async (data) => {
    let formData: any = new FormData();
    formData.append('file', data.file);
    await postDeviceInterconnectionParamImport(formData, {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    });
    message.success(t('sys.importSuccess'));
    getTableData();
  };

  watch(
    () => searchKey.value,
    (val) => {
      if (!val) {
        getTableData();
      }
    },
  );
  onMounted(() => {
    getTableData();
  });
</script>
<style lang="less" scoped>
  :deep(.gct-iconfont) {
    font-size: 14px;
  }

  .select {
    color: var(--ant-primary-color);
  }

  .delete {
    display: inline-block;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 100px;
    background: #e7e9ef;
    cursor: pointer;

    &:hover {
      color: #fff;
    }

    :deep(.icon-del_pic) {
      font-size: 8px;
    }
  }
</style>
