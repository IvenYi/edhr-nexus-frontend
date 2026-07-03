<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="t('sys.developer.devive.chooseParams')"
    centered
    width="764px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <BasicTable
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :columns="columns"
      :dataSource="tableData"
      :pagination="pagination"
      @change="handleTableChange"
      :rowSelection="rowSelection"
      :rowKey="(record) => record.key"
      :scroll="{ y: 486 }"
    >
      <template #headerTop>
        <a-input
          v-model:value="searchKey"
          style="width: 300px"
          :placeholder="$t('sys.integration.inputParamCodeOrName')"
          @pressEnter="getTableData()"
        >
          <template #prefix>
            <i class="gct-iconfont icon-search1"></i>
          </template>
        </a-input>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          {{ t(typeEnum[record.type]) }}
        </template>
        <template v-else>{{ record[column.key] || '--' }}</template>
      </template>
    </BasicTable>
  </basic-modal>
</template>
<script setup lang="ts">
  import { reactive, ref, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getDeviceInterconnectionParamPageList } from '/@/apis/gct-platform/DeviceInterconnectionParamController';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { typeEnum } from '../../enum';

  const { t } = useI18n();
  const emit = defineEmits(['ok']);
  const curKey = ref();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    getTableData();
    curKey.value = data?.key;
    allSelectedRowKeys.value = [];
    allSelectedRowsMap.value = new Map();
    if (data && data.selectedRow && data.selectedRow.length) {
      allSelectedRowKeys.value = data.selectedRow.map((i) => {
        return i.key.split(':')[i.key.split(':').length - 1];
      });
      console.log('allSelectedRowKeys.value', allSelectedRowKeys.value);
      data.selectedRow.forEach((p) => {
        allSelectedRowsMap.value.set(p.key, p);
      });
    }
  });
  const columns = [
    {
      title: t('sys.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('sys.platform.code'),
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: t('sys.type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('sys.notes'),
      dataIndex: 'remark',
      key: 'remark',
    },
  ];

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const tableData = ref<Array<any>>([]);

  // 关键：存储所有选中的行key（跨页）
  const allSelectedRowKeys = ref<string[]>([]);
  // 存储所有选中的完整数据（跨页）
  const allSelectedRowsMap = ref<Map<string, any>>(new Map());

  const searchKey = ref();
  // 行选择配置 - 关键实现跨页选择
  const rowSelection = computed<TableRowSelection>(() => {
    return {
      type: 'checkbox',
      fixed: true,
      selectedRowKeys: currentPageSelectedKeys.value,
      onChange: handleRowChange,
      onSelect: handleSelect,
      onSelectAll: handleSelectAll,
    };
  });

  // 当前页选中的key（用于rowSelection）
  const currentPageSelectedKeys = computed(() => {
    const currentPageKeys = tableData.value.map((item) => item.key);
    // 返回在当前页且被选中的key
    return allSelectedRowKeys.value.filter((key) => currentPageKeys.includes(key));
  });

  // 处理单行选择/取消选择
  const handleSelect = (record: any, selected: boolean) => {
    const key = record.key;

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

    console.log('当前选中keys:', allSelectedRowKeys.value);
  };

  // 处理全选/取消全选当前页
  const handleSelectAll = (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    const currentPageKeys = tableData.value.map((item) => item.key);

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
          allSelectedRowsMap.value.set(record.key, record);
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
    const currentPageKeys = tableData.value.map((item) => item.key);

    // 更新当前页的选中状态
    currentPageKeys.forEach((key) => {
      if (selectedKeys.includes(key) && !allSelectedRowKeys.value.includes(key)) {
        // 添加到全局选中
        allSelectedRowKeys.value.push(key);
        const record = tableData.value.find((item) => item.key === key);
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
      tableData.value =
        res?.data?.map((i) => {
          return {
            ...i,
            code: i.key,
          };
        }) || [];
      pagination.total = res?.totalCount || 0;
      if (res?.totalCount && !res?.data.length) {
        pagination.current -= 1;
        getTableData();
      }
    });
  };

  watch(
    () => searchKey.value,
    (val) => {
      if (!val) {
        getTableData();
      }
    },
  );

  const handleOk = () => {
    emit('ok', Array.from(allSelectedRowsMap.value.values()), curKey.value);
    closeModal();
  };

  const handleClose = () => {
    searchKey.value = '';
  };
</script>
