<template>
  <a-spin :spinning="loading" size="default" :wrapperClassName="`${prefixCls}__loading-wrap`">
    <CardBox :cardExtraProps="{ title: compTitle, style: { height: '100%' } }">
      <template #card-body>
        <div class="scroll-wrap" ref="scrollWrapRef" style="height: 100%">
          <a-tabs v-model:activeKey="activeKey" @change="tabClick">
            <a-tab-pane :tab="type.label" v-for="type in typesList" :key="type.key">
              <base-vxe-table
                class="h-100%"
                :tableColumns="columns"
                :data-source="dataSource"
                :loading="tableLoading"
                showPagination
                v-model:pagination="pagination"
                @request-table-data="handleTableChange"
              >
                <template #custom_item="{ column: { field }, record }">
                  {{
                    record?._DICT?.['container_id_']?.[record.container_id_].join('') ??
                    record?._DICT?.['sn_id_']?.[record.sn_id_].join('') ??
                    field
                  }}
                </template>
                <template #operate="{ row: record }">
                  <table-action-auto
                    :actions="[
                      {
                        label: $t('sys.edhr.handle'),
                        onClick: () => handleOperation(record),
                        // ifShow: () =>
                        //   Boolean(
                        //     !(
                        //       record.component_key_ === 'component_split' &&
                        //       activeKey === 'sn_is_not_null_'
                        //     ),
                        //   ),
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
    </CardBox>
  </a-spin>
</template>

<script setup lang="ts" name="my-transaction">
  import { ref, onMounted, reactive, computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import CardBox from './card-box.vue';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { openDocumentFillingModal } from '/@web-render/render/Event/utils/builtInMethods';
  import {
    openEdhrReworkProcessModal,
    openEdhrTxnSplitModal,
  } from '/@/projects/web-render/src/render/Event/utils/kitEdhr';
  import BaseVxeTable from '../../../../components/base-vxe-table/index.vue';
  import { TableActionAuto } from '/@/components/Table';

  import type { TableColumnsType } from 'ant-design-vue';

  const columns: TableColumnsType = computed(() => {
    return [
      { title: $t('sys.no'), field: 'txn_no_', key: 'txn_no_', width: 150, ellipsis: true },
      {
        title: $t('sys.edhr.materialStatus.TXN'),
        field: 'txn_definition_id_',
        key: 'txn_definition_id_',
        ellipsis: true,
        formatter: ({ cellValue, row, column }) => {
          const { field } = column;
          return row?._DICT?.[field]?.[cellValue].join('') ?? cellValue;
        },
      },
      {
        title: activeKey.value === 'sn_is_not_null_' ? 'SN' : $t('sys.edhr.materialStatus.LOT'),
        field: 'container_or_sn_',
        key: 'container_or_sn_',
        ellipsis: true,
        slots: {
          default: 'custom_render',
        },
      },
      {
        title: $t('sys.edhr.dashboard.mfgOrderCode'),
        field: 'mfg_order_code_',
        key: 'mfg_order_code_',
        ellipsis: true,
      },
      {
        title: $t('sys.createTime'),
        field: 'create_time_',
        key: 'create_time_',
        ellipsis: true,
        width: 176,
      },
      // {
      //   title: '操作',
      //   key: 'operation',
      //   fixed: 'right',
      //   width: 100,
      // },
    ];
  });

  const dataSource = ref<any>([]);

  const scrollWrapRef = ref<HTMLElement | null>(null);
  const tableScrollY = ref<number>(300);

  // 计算表格滚动高度
  const calculateTableHeight = () => {
    if (scrollWrapRef.value) {
      // 获取容器高度
      const containerHeight = scrollWrapRef.value.clientHeight;
      // 减去 tabs 头部高度(大约40px)和一些边距
      tableScrollY.value = containerHeight - 150; // 40px tabs高度, 20px 边距
    }
  };

  onMounted(async () => {
    await reload();
    // 初始计算
    setTimeout(() => {
      calculateTableHeight();
    }, 100); // 延迟确保DOM渲染完成
  });

  const { prefixCls } = useDesign('my-transaction');

  interface Props {
    /** 组件标题 */
    compTitle: string;
  }

  defineProps<Props>();

  const loading = ref<boolean>(true);
  const tableLoading = ref<boolean>(false);

  const typesList = [
    {
      label: $t('sys.edhr.dashboard.lotTxn'),
      key: 'container_is_not_null_',
    },
    {
      label: $t('sys.edhr.dashboard.snTxn'),
      key: 'sn_is_not_null_',
    },
  ];

  const activeKey = ref<string>('container_is_not_null_');

  const handleTableChange = ({ current, pageSize }) => {
    pagination.current = current;
    pagination.pageSize = pageSize;
    reload();
  };

  const pagination = reactive({
    current: 1,
    total: 0,
    pageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '40', '50'],
    showTotal: (total) => $t('sys.component.table.total', { total }),
  });

  const tabClick = () => {
    handleTableChange({
      current: 1,
      pageSize: 20,
    });
  };

  async function reload() {
    if (!loading.value) {
      tableLoading.value = true;
    }
    dataSource.value = [];
    const { current, pageSize } = pagination;
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_txn_inst',
        bsKey: 'biz_txn_inst_list_search',
      },
      {
        query: {
          effective_: true,
          needPermission: true,
          [activeKey.value]: true,
          status_list_: ['waiting', 'running'],
        },
        exp: '',
        pageNo: current,
        pageSize,
        foreignFields: [],
        sorts: [
          {
            sortField: 'create_time_',
            sortType: 'desc',
          },
        ],
      },
    );
    if (res) {
      const tableData = transformSourceData(res.data, res.dict);
      dataSource.value = tableData;
      pagination.total = res.totalCount;
      pagination.pageSize = res.pageSize;
      pagination.current = res.pageNo;
    }
    tableLoading.value = false;

    loading.value = false;
  }

  const handleOperation = (rowData) => {
    const taskType = activeKey.value === 'container_is_not_null_' ? 'container' : 'sn';
    const isSN = taskType === 'sn';
    const { component_key_, current_task_type_ } = rowData;
    // 表单节点
    if (current_task_type_ === 'form_node' && rowData.online_form_inst_id_) {
      openDocumentFillingModal({
        selfId: rowData.online_form_inst_id_,
        callback: () => {
          handleTableChange({
            current: 1,
            pageSize: 20,
          });
        },
      });
    }
    // 配置节点
    if (current_task_type_ === 'config_node') {
      // 返工配置
      if (component_key_ === 'component_rework') {
        openEdhrReworkProcessModal({
          single: taskType === 'sn' ? true : false,
          opeType: taskType === 'sn' ? 'add' : undefined,
          params: {
            taskType,
            ...rowData,
            txn_inst_id_: rowData.id_,
            container_id_: isSN ? undefined : rowData?.container_id_,
            sn_id_: isSN ? rowData?.sn_id_ : undefined,
            product_id_: rowData?.product_id_,
          },
          callback: () => {
            handleTableChange({
              current: 1,
              pageSize: 20,
            });
          },
        });
      }
      // 拆分（SN不需要触发）
      if (component_key_ === 'component_split' && !isSN) {
        openEdhrTxnSplitModal({
          params: rowData,
          callback: () => {
            handleTableChange({
              current: 1,
              pageSize: 20,
            });
          },
        });
      }
    }
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-my-transaction';

  .@{prefix-cls} {
    &__loading-wrap {
      display: flex;
      position: relative;
      flex: auto;
      // height: 0;
      flex-direction: column;
      flex-grow: 1;
      width: 100%;
      height: 100%;

      .ant-spin-container {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
<style lang="less" scoped>
  :deep(.ant-tabs) {
    height: 100%;

    .ant-tabs-content {
      height: 100%;
    }
  }
</style>
