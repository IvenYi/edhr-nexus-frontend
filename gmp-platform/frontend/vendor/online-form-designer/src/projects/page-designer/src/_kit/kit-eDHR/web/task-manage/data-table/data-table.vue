<template>
  <a-table
    class="task-manage-data-table"
    :columns="(tableColumns as any)"
    :data-source="tableData"
    :loading="loading"
    :pagination="paginationAttr"
    :scroll="{ x: 'max-content' }"
    @change="(paginationInfo) => handleTableChange(paginationInfo)"
  >
    <template #headerCell="{ title, column }">
      <template v-if="column.dataIndex === 'f_current_routing_operation_ids__jhwd'">
        当前工序
      </template>
      <template v-else> {{ title }} </template>
    </template>

    <template #bodyCell="{ text, column, record, index }">
      <template v-if="column.key === 'index'">
        {{ index + 1 }}
      </template>
      <template v-else-if="column.key === 'action'">
        <span class="task-table-action">
          <template v-for="op in inlineActions" :key="op.key">
            <a-button
              v-if="op.key !== 'delete'"
              type="link"
              :key="op.key"
              @click="onActionClick(op, record)"
            >
              {{ op.name }}
            </a-button>
            <a-popconfirm v-else title="是否确认删除?" @confirm="handleDelete(record)">
              <a-button type="link" danger>
                {{ op.name }}
              </a-button>
            </a-popconfirm>
          </template>
        </span>
      </template>
      <template v-else-if="column.key === 'f_status__jhwd'">
        <a-tag :bordered="false" :color="mapTaskStatus(text)">{{
          dataDict?.[column.key]?.[text]
        }}</a-tag>
      </template>
      <template v-else-if="['f_current_routing_operation_ids__jhwd'].includes(column.key)">
        <a-dropdown>
          <a
            class="ant-dropdown-link"
            @click.prevent="onViewOperation(getCurrentOperation(record)?.current, record)"
          >
            {{ getCurrentOperation(record)?.current?.label }}
            <span
              v-if="!!getCurrentOperation(record)?.options?.length"
              style="font-size: 12px"
              class="ml-2 p-x-4px inline-block bg-[#e6f7ff] text-[#1890ff] border-rd-xl"
            >
              {{ getCurrentOperation(record)?.options?.length }}
              <DownOutlined />
            </span>
          </a>
          <template #overlay v-if="!!getCurrentOperation(record)?.options?.length">
            <a-menu>
              <a-menu-item
                v-for="op in getCurrentOperation(record)?.options"
                :key="op.value"
                @click="onViewOperation(op, record)"
              >
                <a>{{ op.label }}</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
      <template v-else>
        {{ dataDict?.[column.key]?.[text] || text }}
      </template>
    </template>
  </a-table>

  <ViewDetailDialog v-if="!isDesign" ref="viewDetailDialog" :widgetList="viewFields" />
  <ViewOperationDialog v-if="!isDesign" ref="viewOperationDialog" :widget="operationWidget" />
</template>

<script lang="ts" setup>
  import { ref, computed, reactive, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  // @ts-ignore
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import ViewDetailDialog from '../dialog/view-lot-dialog.vue';
  import ViewOperationDialog from '../dialog/view-operation-dialog.vue';
  // import FieldWidget from '../../components/field-widget.vue';
  import { designData, tableInlineActions } from './designData';
  import { ITaskManage } from '../schema';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    mode: 'design' | 'render';
    widget: ITaskManage;
    initialParams: object;
  }>();

  const emit = defineEmits(['refresh-tabs']);

  const { t } = useI18n();
  const Event = getPageEvent();
  const inlineActions = tableInlineActions;
  const loading = ref(false);

  const isDesign = computed(() => props.mode === 'design');

  const tableFields = computed(() => {
    return props.widget?.children?.[1];
  });
  const viewFields = computed(() => {
    return props.widget?.children?.[2];
  });
  const operationWidget = computed(() => {
    return props.widget?.children?.[3];
  });
  const tableColumns = computed(() => {
    const columns = (tableFields.value ?? []).map((f) => {
      return {
        title: f.alias || f.props.fieldName,
        dataIndex: f.props.field,
        key: f.props.field,
        props: f.props,
      };
    });
    columns.unshift({
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      fixed: 'left',
      width: 60,
    });
    columns.push({
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
    });
    return columns;
  });

  const dataDict = ref({});
  const dataSource = ref([]);
  const tableData = computed(() => {
    if (isDesign.value) return designData;
    return dataSource.value;
  });

  const query = ref({});
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
  const viewDetailDialog = ref();
  const viewOperationDialog = ref();

  function mapTaskStatus(status) {
    const statusMap = {
      running: 'processing',
      waiting: 'default',
      hold: 'warning',
      close: 'error',
      finished: 'success',
    };

    return statusMap[status] || 'default';
  }

  function getCurrentOperation(rowData) {
    // 获取当前操作
    const operationList = rowData.f_current_routing_operation_ids__jhwd?.split(',') ?? [];
    const currentOperation = {
      label: dataDict.value['f_current_routing_operation_ids__jhwd']?.[operationList[0]],
      value: operationList[0],
    };
    let nextOptions: any[] = [];
    if (operationList?.length > 1) {
      nextOptions = operationList.slice(1)?.map((op) => {
        return {
          label: dataDict.value['f_current_routing_operation_ids__jhwd']?.[op],
          value: op,
        };
      });
    }

    return {
      current: currentOperation,
      options: nextOptions,
    };
  }

  function onActionClick(option, rowData) {
    const { key } = option;
    switch (key) {
      case 'print':
        handlePrint(rowData);
        break;
      case 'view':
        handleView(key, rowData);
        break;
      case 'task':
        handleToTask(rowData);
        break;
      default:
        break;
    }
  }

  function onViewOperation(op: any, rowValue) {
    viewOperationDialog.value.onOpen(op, {
      ...rowValue,
      routing_id__ri_: rowValue.f_routing_id__jhwd_ri_,
    });
  }

  function handlePrint(rowValue) {}

  function handleView(key, rowValue) {
    viewDetailDialog.value.onOpen(key, {
      ...rowValue,
      _DICT: dataDict.value,
      _OPCT: dataDict.value,
    });
  }

  async function handleToTask(rowValue) {
    try {
      await Event.context.$customBizService.post(
        {
          action: 'startOfContainer',
          key: 'em_container',
        },
        {
          container_id_: rowValue.f_id__jhwd,
        },
      );
      message.success('执行成功');
      getTableData();
      emit('refresh-tabs');
    } catch (err) {}
  }

  async function handleDelete(rowValue) {
    try {
      await Event.context.$customBizService.delete(
        {
          action: 'removeOfContainer',
          key: 'em_container',
        },
        {
          container_id_: rowValue.f_id__jhwd,
        },
      );
      message.success('批次任务删除成功');
      getTableData();
      emit('refresh-tabs');
    } catch (err) {}
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
        {
          action: 'listByPage',
          key: props.widget.props.model || 'em_container',
          modelCategory: props.widget.props?.modeldata?.modelCategory || 'entity',
        },
        {
          query: {
            ...query.value,
            ...(props.initialParams ?? {}),
            ...params,
          },
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize,
          foreignFields: tableFields.value
            .filter((i) => i.props.isFieldModel)
            .map((i) => i.props.bindFieldLink?.join('.')),
          sorts: [
            {
              sortField: 'f_create_time__jhwd',
              sortType: 'desc',
            },
          ],
        },
      );
      dataSource.value = res.data;
      dataDict.value = res.dict;
      pagination.total = res.totalCount;
      pagination.pageNo = res.pageNo;
      pagination.pageSize = res.pageSize;
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    getTableData();
  });

  defineExpose({
    loadData: (params?) => {
      getTableData(params);
    },
  });
</script>

<style lang="less" scoped>
  .task-table-action {
    .ant-btn {
      padding-left: 4px;
      padding-right: 4px;
    }
  }

  .task-manage-data-table {
    :deep(.ant-tag) {
      padding: 2px 8px;
      border: none;
      &-default {
        background-color: #eee;
        color: #797a7d;
      }
    }
  }
</style>
