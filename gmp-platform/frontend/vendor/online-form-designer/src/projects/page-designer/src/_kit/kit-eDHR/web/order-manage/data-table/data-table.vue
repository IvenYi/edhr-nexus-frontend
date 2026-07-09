<template>
  <a-table
    class="order-manage-data-table"
    :columns="(tableColumns as any)"
    :data-source="tableData"
    :loading="loading"
    :pagination="paginationAttr"
    :scroll="{ x: 2500 }"
    size="middle"
    @change="(paginationInfo) => handleTableChange(paginationInfo)"
  >
    <template #bodyCell="{ column, record, index, text }">
      <template v-if="column.key === 'index'">
        {{ index + 1 }}
      </template>
      <template v-else-if="column.key === 'action'">
        <span class="order-table-action">
          <template v-for="op in inlineActions" :key="op.key">
            <a-popconfirm
              v-if="op.key === 'delete'"
              title="是否确认删除?"
              @confirm="handleDelete(record)"
            >
              <span
                v-if="record.status_ === 'waiting' && record.attr_status_ === 'selfbuilt'"
                class="error-gct mx4px cursor-pointer inline-block"
              >
                {{ op.name }}
              </span>
            </a-popconfirm>
            <template v-else>
              <span
                v-if="!(op.key === 'edit' && record.status_ !== 'waiting')"
                :key="op.key"
                class="primary-gct cursor-pointer inline-block mx4px"
                @click="onActionClick(op, record)"
              >
                {{ op.name }}
              </span>
            </template>
          </template>
        </span>
      </template>
      <template v-else-if="column.key === 'status_'">
        <a-tag :bordered="false" :color="mapOrderStatus(text)">{{
          dataDict?.[column.key]?.[text]
        }}</a-tag>
      </template>
      <template v-else>
        {{ dataDict?.[column.key]?.[text] || text }}
      </template>
    </template>
  </a-table>

  <CreateOrderDialog
    ref="createOrderDialogRef"
    :widgetList="orderCreateWidgets"
    @submitted="getTableData"
  />

  <CreateLotDialog
    ref="createLotDialogRef"
    :widgetList="lotCreateWidgets"
    @submitted="getTableData"
  />
</template>
<script lang="ts" setup>
  import { ref, computed, reactive, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  // @ts-ignore
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import CreateLotDialog from '../dialog/create-lot-dialog.vue';
  import CreateOrderDialog from '../dialog/create-order-dialog.vue';
  import { designData, tableInlineActions } from './designData';
  import { IOrderManage } from '../schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useAppDynamicTabs } from '@/components/AppDynamicTabs';

  const props = defineProps<{
    dataId: string;
    mode: 'design' | 'render';
    widget: IOrderManage;
    initialParams: object;
  }>();

  // const { getAllTabsCount } = useAppDynamicTabs();
  const emit = defineEmits(['refresh']);
  const Event = getPageEvent();
  const { t } = useI18n();
  const inlineActions = tableInlineActions;

  const loading = ref(false);
  const isDesign = computed(() => props.mode === 'design');

  const tableFields = computed(() => {
    return props.widget?.children?.[1];
  });

  const orderCreateWidgets = computed(() => {
    return props.widget?.children?.[2];
  });

  const lotCreateWidgets = computed(() => {
    return props.widget?.children?.[3];
  });

  const dataSource = ref([]);
  const dataDict = ref({});
  const tableData = computed(() => {
    if (isDesign.value) return designData;

    return dataSource.value;
  });
  const tableColumns = computed(() => {
    const columns = (tableFields.value ?? []).map((f) => {
      return {
        title: f.alias || f.props.fieldName,
        dataIndex: f.props.field,
        key: f.props.field,
        ellipsis: true,
      };
    });
    // columns.unshift({
    //   title: '序号',
    //   dataIndex: 'index',
    //   key: 'index',
    //   // fixed: 'left',
    //   width: 60,
    // });
    columns.push({
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 250,
    });
    return columns;
  });

  const pagination = reactive({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });
  const pageSizeOptions = reactive([10, 20, 30, 40, 50]);
  const paginationAttr = computed(() => {
    return {
      current: pagination.pageNo,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showSizeChanger: true,
      pageSizeOptions: pageSizeOptions.map((i) => i + ''),
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

  // dialogRef
  const createOrderDialogRef = ref();
  const createLotDialogRef = ref();

  function onActionClick(option, rowData) {
    const { key } = option;
    switch (key) {
      case 'begin':
        handleBegin(rowData);
        break;
      case 'edit':
        onCreate('edit', rowData);
        break;
      case 'createLot':
        handleCreateLot(rowData);
        break;
      case 'delete':
        handleDelete(rowData);
        break;
      case 'view':
        handleView(key, rowData);
        break;
      default:
        break;
    }
  }

  function onCreate(type?, data?) {
    createOrderDialogRef.value.onOpen(type, data);
  }

  function mapOrderStatus(status) {
    const statusMap = {
      waiting: 'default',
      finished: 'success',
      closed: 'error',
      paused: 'warning',
      unfinished: 'processing',
    };

    return statusMap[status] || 'default';
  }

  async function handleBegin(rowValue) {
    await Event.context.$customBizService.post(
      {
        action: 'biz_start',
        key: 'em_mfg_order',
      },
      {
        id_: rowValue.id_,
      },
    );
    message.success('开始成功');
    getTableData();
    emit('refresh');
  }

  function handleCreateLot(rowValue) {
    createLotDialogRef.value.onOpen({
      ...rowValue,
      DICT: dataDict.value,
    });
    emit('refresh');
  }

  async function handleDelete(rowValue) {
    await Event.context.$httpBizService(
      {
        action: 'removeById',
        key: 'em_mfg_order',
      },
      {
        id: rowValue.id_,
      },
    );
    message.success('删除成功');
    getTableData();
    emit('refresh');
  }

  function handleView(key, rowValue) {
    createOrderDialogRef.value.onOpen(key, {
      ...rowValue,
      _DICT: dataDict.value,
    });
  }

  function handleTableChange(paginationInfo) {
    pagination.pageNo = paginationInfo.current;
    pagination.pageSize = paginationInfo.pageSize;
    getTableData();
  }

  async function getTableData(params?) {
    if (isDesign.value) return;

    try {
      loading.value = true;
      const res = await Event.context.$httpBizService(
        { action: 'listByPage', key: 'em_mfg_order' },
        {
          query: {
            ...(props.initialParams ?? {}),
            ...params,
          },
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
        },
      );
      dataSource.value = res.data;
      dataDict.value = res.dict;
      pagination.total = res.totalCount;
      pagination.pageNo = res.pageNo;
      pagination.pageSize = res.pageSize;
    } catch (err) {
      loading.value = false;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    getTableData();
  });

  defineExpose({
    dataSource,
    onAdd: onCreate,
    loadData: (params?) => {
      getTableData(params);
    },
  });
</script>

<style lang="less" scoped>
  .order-table-action {
    .ant-btn {
      padding-left: 4px;
      padding-right: 4px;
    }
  }
  .order-manage-data-table {
    :deep(.ant-tag) {
      padding: 2px 8px !important;
      border: none !important;
      &-default {
        background-color: #eee;
        color: #797a7d;
      }
    }
  }
</style>
