<template>
  <div class="ks-column h100%">
    <div class="bg-[#F7F8FA] rounded-4px px16px pt16px">
      <a-form :model="form">
        <a-row :gutter="20">
          <a-col :span="6">
            <a-form-item label="返工任务名称">
              <a-input
                v-model:value="form.f_rework_name__jhwd"
                type="text"
                allowClear
                placeholder="请输入返工任务名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="关联生产主批次">
              <a-input
                v-model:value="form.f_name__jhwd"
                type="text"
                allowClear
                placeholder="请输入关联生产主批次"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="工单编号">
              <a-input
                v-model:value="form.f_code__jhwd"
                type="text"
                allowClear
                placeholder="请输入工单编号"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="订单编号">
              <a-input
                v-model:value="form.f_order_code__jhwd"
                type="text"
                allowClear
                placeholder="请输入订单编号"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="物料名称">
              <a-tree-select
                v-model:value="form.f_product_id__jhwd"
                style="width: 100%"
                :tree-data="productOptions"
                show-search
                placeholder="请选择物料名称"
                allowClear
                treeNodeLabelProp="full_path"
                :virtual="false"
                :filterTreeNode="() => true"
                dropdown-class-name="gct-custom-select-dropdown vxe-table--ignore-clear"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="任务状态">
              <a-select
                v-model:value="form.f_status__jhwd"
                style="width: 100%"
                :options="statusOptions"
                show-arrow
                allow-clear
                placeholder="请选择任务状态"
              />
            </a-form-item>
          </a-col>
          <!-- <a-col :span="6">
            <a-form-item label="打印状态">
              <a-select
                v-model:value="form.f_status_print__jhwd"
                style="width: 100%"
                :options="printOptions"
                show-arrow
                allow-clear
                placeholder="请选择打印状态"
              />
            </a-form-item>
          </a-col> -->
          <a-col :span="6">
            <a-form-item label="工单计划开始时间">
              <a-range-picker
                v-model:value="form.f_planned_start_date__jhwd"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="工单计划结束时间">
              <a-range-picker
                v-model:value="form.f_planned_completion_date__jhwd"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="工单实际结束时间">
              <a-range-picker
                v-model:value="form.f_real_start_date__jhwd"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="工单实际结束时间">
              <a-range-picker
                v-model:value="form.f_real_completion_date__jhwd"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="任务拆分时间">
              <a-range-picker
                v-model:value="form.f_create_time__jhwd"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="任务实际开始时间">
              <a-range-picker
                v-model:value="form.f_start_date__jhwd"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="任务实际完成时间">
              <a-range-picker
                v-model:value="form.f_completion_date__jhwd"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :span="18" class="text-right">
            <a-button @click="onReset">{{ $t('sys.reset') }}</a-button>
            <a-button
              type="primary"
              class="ml12px"
              @click="
                pagination.current = 1;
                getTableData();
              "
            >
              {{ $t('sys.query') }}
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="ks-col ks-column overflow-hidden mt16px">
      <!-- <div class="text-right mb16px">
      </div> -->
      <div class="ks-col ks-column overflow-hidden pb16px">
        <a-table
          class="flex-1 h100%"
          ref="tableContainerRef"
          :row-selection="{
            fixed: true,
          }"
          row-key="id"
          :columns="columns"
          :data-source="tableData"
          :pagination="pagination"
          :resizable="true"
          @change="handleTableChange"
          :loading="loading"
          size="middle"
          :scroll="{
            x: 2800,
            y: scrollHeight,
          }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'f_status__jhwd'">
              <a-tag :color="record.statusColor">
                {{ record.f_status__jhwd }}
              </a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <table-action-auto
                :actions="[
                  // {
                  //   label: record.isPrint ? '重打任务单' : '打印任务单',
                  //   // onClick: () => onAdd(record),
                  // },
                  {
                    // ifShow: record.,
                    label: '作业执行',
                    onClick: () => handleToTask(record),
                  },
                  {
                    ifShow: !!record._DICT?.f_status__jhwd['waiting'],
                    label: '删除',
                    color: 'error',
                    popConfirm: {
                      title: $t('sys.sureToDo'),
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
  </div>

  <QueryDefinition ref="queryDefinitionRef" :configId="tabsConfigId" />
</template>
<script setup lang="ts">
  import { EntityModelCategoryEnum, useAntTableScrollHeight } from '@gct/runtime';
  import { TableActionAuto } from '/@/components/Table';
  import { message, TablePaginationConfig } from 'ant-design-vue';
  import { ref, reactive, computed, onMounted, h } from 'vue';
  import QueryDefinition from './components/AppDynamicTabs/tabs-modal.vue';
  import { useUserStore } from '/@/store/modules/user';
  import {
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    getModelComprehensiveEnumInfoByModelCategory,
    deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { useRouter } from 'vue-router';

  const props = defineProps<{
    queryParams?: object;
  }>();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  const form = ref({});
  const tableData = ref<any[]>([]);
  const loading = ref(false);
  const statusOptions = ref<any[]>([]);
  // const printOptions = ref<any[]>([]);
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => $t('sys.component.table.total', { total }),
  });
  const userInfoStore = useUserStore();
  const tabsConfigId = computed(() => {
    const userId = userInfoStore.userInfo.userId;
    return `${userId}_tab_order`;
  });
  const productOptions = ref([]);
  const columns = [
    {
      title: '返工任务名称',
      dataIndex: 'f_rework_name__jhwd',
      key: 'f_rework_name__jhwd',
      ellipsis: true,
      width: 160,
    },
    {
      title: '关联生产主批次',
      dataIndex: 'f_name__jhwd',
      key: 'f_name__jhwd',
      ellipsis: true,
      width: 160,
    },

    {
      title: '工单编号',
      dataIndex: 'f_code__jhwd',
      key: 'f_code__jhwd',
      ellipsis: true,
      width: 180,
    },
    {
      title: '所属订单编号',
      dataIndex: 'f_product_id__jhwd',
      key: 'f_product_id__jhwd',
      ellipsis: true,
      width: 180,
    },
    {
      title: '物料名称',
      dataIndex: 'f_order_code__jhwd',
      key: 'f_order_code__jhwd',
      ellipsis: true,
      width: 180,
    },
    {
      title: '工艺路线',
      dataIndex: 'f_routing_id__jhwd',
      key: 'f_routing_id__jhwd',
      ellipsis: true,
      width: 160,
    },
    {
      title: '原始数量',
      dataIndex: 'f_original_qty__jhwd',
      key: 'f_original_qty__jhwd',
      ellipsis: true,
      width: 140,
    },
    {
      title: '实际产出数量',
      dataIndex: 'f_good_qty__jhwd',
      key: 'f_good_qty__jhwd',
      ellipsis: true,
      width: 140,
    },
    {
      title: '报废数量',
      dataIndex: 'f_scrap_qty__jhwd',
      key: 'f_scrap_qty__jhwd',
      ellipsis: true,
      width: 140,
    },
    {
      title: '单位',
      dataIndex: 'f_uom_id__jhwd',
      key: 'f_uom_id__jhwd',
      ellipsis: true,
      width: 120,
    },
    {
      title: '打印状态',
      // dataIndex: 'f_uom_id__jhwd',
      // key: 'f_uom_id__jhwd',
      ellipsis: true,
      width: 120,
    },
    {
      title: '工单计划开始时间',
      dataIndex: 'f_planned_start_date__jhwd',
      key: 'f_planned_start_date__jhwd',
      ellipsis: true,
      width: 170,
    },
    {
      title: '工单计划结束时间',
      dataIndex: 'f_planned_completion_date__jhwd',
      key: 'f_planned_completion_date__jhwd',
      ellipsis: true,
      width: 170,
    },
    {
      title: '工单实际开始时间',
      dataIndex: 'f_real_start_date__jhwd',
      key: 'f_real_start_date__jhwd',
      ellipsis: true,
      width: 170,
    },
    {
      title: '工单实际结束时间',
      dataIndex: 'f_real_completion_date__jhwd',
      key: 'f_real_completion_date__jhwd',
      ellipsis: true,
      width: 140,
    },
    {
      title: '任务创建时间',
      dataIndex: 'f_create_time__jhwd',
      key: 'f_create_time__jhwd',
      ellipsis: true,
      width: 170,
    },
    {
      title: '任务实际开始时间',
      dataIndex: 'f_start_date__jhwd',
      key: 'f_start_date__jhwd',
      ellipsis: true,
      width: 170,
    },
    {
      title: '任务实际完成时间',
      dataIndex: 'f_completion_date__jhwd',
      key: 'f_completion_date__jhwd',
      ellipsis: true,
      width: 170,
    },
    {
      title: '当前工序',
      dataIndex: 'f_current_routing_operation_names__jhwd',
      key: 'f_current_routing_operation_names__jhwd',
      ellipsis: true,
      width: 120,
      fixed: 'right',
    },
    {
      title: '任务状态',
      dataIndex: 'f_status__jhwd',
      key: 'f_status__jhwd',
      ellipsis: true,
      width: 120,
      fixed: 'right',
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      align: 'left',
      fixed: 'right',
      width: 170,
    },
  ];

  const eqFields = ['f_status__jhwd', 'f_product_id__jhwd'];
  const likeFields = ['f_rework_name__jhwd', 'f_name__jhwd', 'f_code__jhwd', 'f_order_code__jhwd'];

  onMounted(() => {
    getTableData();
    getStatusData();
    getProductData();
  });

  const statusMap = {
    waiting: 'default',
    running: 'processing',
    finished: 'success',
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const getTableData = async (body?) => {
    loading.value = true;
    const query = { ...form.value };
    for (let k in query) {
      let ope;
      if (eqFields.includes(k)) ope = 'eq';
      else if (likeFields.includes(k)) ope = 'like';
      else ope = 'range';
      query[`${k}.${ope}`] = query[k];
      delete query[k];
    }
    const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listByPage',
        modelKey: 'vm_container_task_jhwd',
        modelCategory: EntityModelCategoryEnum.VIEW,
      },
      {},
      {
        pageSize: pagination.pageSize,
        pageNo: pagination.current,
        query: {
          ...(props.queryParams || {}),
          ...query,
          'f_reworked__jhwd.eq': 1,
        },
      },
    ).finally(() => {
      loading.value = false;
    });
    tableData.value = transformSourceData(
      res.data.map((e) => {
        return { ...e, statusColor: statusMap[e.f_status__jhwd] };
      }),
      res.dict,
    ).map((e) => {
      for (let k in e) {
        if (e[k] && e._DICT[k]) {
          const val = e._DICT[k][e[k]];
          e[k] = Array.isArray(val) ? val.join(';') : val;
        }
      }
      return e;
    });
    pagination.total = res.totalCount;
  };

  const onReset = () => {
    form.value = {};
    pagination.current = 1;
    getTableData();
  };

  const getStatusData = async () => {
    const res: any = await getModelComprehensiveEnumInfoByModelCategory(
      { modelCategory: EntityModelCategoryEnum.ENTITY },
      {
        modelKey: 'em_container',
        fieldKey: 'status_',
      },
    );
    statusOptions.value = res?.map((e) => {
      return {
        ...e,
        label: e.text,
      };
    });
  };

  const getProductData = async () => {
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'rdoListByPage',
        modelKey: 'em_product',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { pageSize: 999999, pageNo: 1 },
      {},
    );
    productOptions.value = res?.data?.map((e) => {
      return {
        ...e,
        label: e.name_,
        value: e.id_,
        title: e.name_,
        full_path: () =>
          h('div', [
            h('span', `${e.name_}`),
            h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
          ]),
        children: e.__CHILDREN__?.map((f) => {
          return {
            ...f,
            value: `${f.base_id_}:${f.id_}`,
            label: f.name_,

            title: () =>
              h('div', [
                h('span', { class: 'version' }, f.version_),
                f.default_ ? h('span', { class: 'version gct-custom-tag ml8px' }, '默认') : null,
              ]),
            full_path: () => h('div', [h('span', `${f.name_}:${f.version_}`)]),
          };
        }),
      };
    });
  };

  const onDelete = async (rowValue) => {
    try {
      await deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'removeOfContainer',
          modelKey: 'em_container',
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        {
          container_id_: rowValue.f_id__jhwd,
        },
        {},
      );
      message.success('删除成功');
      getTableData();
    } catch (err) {}
  };

  const Router = useRouter();
  async function handleToTask(rowValue) {
    Router.push({
      path: '/4vwPy2rIv4QzwwH4/web_YbUATJBG_jhwd',
      query: {
        f_container_id_jhwd: rowValue.f_name__jhwd,
        f_rework_task_id_jhwd: rowValue.f_id__jhwd,
      },
    });
  }
</script>
<style lang="less" scoped></style>
