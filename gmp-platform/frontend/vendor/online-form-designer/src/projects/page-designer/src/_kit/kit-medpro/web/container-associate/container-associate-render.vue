<template>
  <a-row :gutter="[12, 0]">
    <a-col span="12" class="to-select-box-col">
      <div class="table-wrap">
        <div class="search-box h-60px">
          <a-form-item :label="t('sys.kit.containerName')">
            <a-input style="width: 100%" v-model:value="searchName" @pressEnter="handleSearchData">
              <template #suffix>
                <i class="iconfont icon-sousuo1"></i>
              </template>
            </a-input>
          </a-form-item>
        </div>
        <div class="text-[#212528] text-14px mb-8px">{{ t('sys.pageDesigner.ToBeSelect') }}</div>
        <a-table
          size="middle"
          rowKey="id_"
          bordered
          :data-source="dataSource"
          :columns="leftColumns"
          :loading="loading"
          :row-selection="{
            onSelect: onSelectChange,
            onSelectAll: onSelectAllChange,
            selectedRowKeys: selectedRowKeys,
          }"
          :pagination="showPagination ? paginationAttr : false"
          :scroll="{ y: 300 }"
          @change="(paginationInfo) => handleTableChange(paginationInfo)"
        >
          <template #bodyCell="{ column, index, record, text }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex == 'container_modality_id_'">
              {{ record._DICT?.[column.dataIndex][text].join('') || text }}
            </template>
            <template v-if="column.dataIndex == 'product_id_'">
              {{ record._DICT?.[column.dataIndex][text].join('') || text }}
            </template>
          </template>
        </a-table>
      </div>
    </a-col>
    <a-col span="12" class="be-selected-box-col">
      <div class="table-wrap">
        <div class="text-[#212528] text-14px mb-8px mt-60px">
          <span>{{ t('sys.pageDesigner.beSelected') }}</span>
          <a-button danger @click="deleteAll" style="bottom: 7px; float: right">{{
            t('sys.kit.delAll')
          }}</a-button>
        </div>
        <a-table
          bordered
          rowKey="id_"
          size="middle"
          :data-source="selectedDataSource"
          :columns="rightColumns"
          :pagination="showPagination ? selectedPatinationAttr : false"
          :scroll="{ y: 300 }"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index' && serialNumber">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a danger @click="deleteSelectedRow(record)">{{ t('sys.delete') }}</a>
            </template>
          </template>
        </a-table>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts" name="gct-container-associate-render">
  import { ref, toRefs, toRef, computed, reactive, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // @ts-ignore
  import vxeRenderTable from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable/index.vue';
  import { IContainerAssociate } from './schema';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { QueryDataOptions } from '../../../../components/widgets/web/data/data-table/type';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';

  const { t } = useI18n();
  const defProps = defineProps<{ widget: IContainerAssociate }>();
  const Event = getPageEvent();
  const {
    txnType,
    serialNumber,
    pageSize,
    dataFilter,
    collation,
    collationSort,
    collationField,
    showPagination,
    refSearchForm,
    refContainerField,
  } = toRefs(defProps.widget.props);

  const dataSource = ref<any[]>([]);
  const selectedDataSource = ref<any[]>([]);
  const selectedRowKeys = computed(() => {
    return selectedDataSource.value.map((d) => d.id_);
  });
  const pageSizeOptions = reactive([10, 20, 30, 40, 50]);
  const total = ref(0);
  const loading = ref(false);
  const lastQueryData = ref<Partial<QueryDataOptions>>({});
  const searchName = ref();

  const containerFormData = toRef(() => {
    if (refSearchForm.value) {
      return formMap.value[refSearchForm.value];
    }
    return {};
  });
  watch(
    () => containerFormData.value,
    () => {
      if (!containerFormData.value?.[refContainerField.value || 'id_']) return;
      pagination.pageNo = 1;
      pagination.pageSize = pageSize.value;
      getDataSource();
    },
    {
      deep: true,
    },
  );

  /**排序字段 */
  const querySort = getQuerySort({ collation: collation.value, collationSort, collationField });
  /**数据筛选 */
  const queryfilter = useQueryfilter(dataFilter.value);
  const pagination = reactive<Required<QueryDataOptions>>({
    pageSize: pageSize.value,
    pageNo: 1,
    query: {},
    exp: '',
    sorts: [...querySort],
    foreignFields: [],
  });

  const paginationAttr = computed(() => {
    return {
      current: pagination.pageNo,
      pageSize: pagination.pageSize,
      total: total.value,
      showSizeChanger: true,
      pageSizeOptions: pageSizeOptions.map((i) => i + ''),
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });
  const selectedPatinationAttr = computed(() => {
    return {
      total: selectedDataSource.value?.length,
      showSizeChanger: true,
      pageSizeOptions: pageSizeOptions.map((i) => i + ''),
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });
  /** 待选区列 */
  const leftColumns = computed(() => {
    const colWidgets = defProps.widget.children?.[0] || [];
    const columns = colWidgets.map((widget) => {
      return {
        title: widget.alias,
        dataIndex: widget.props.field,
      };
    });
    if (serialNumber.value) {
      columns.unshift({ title: '序号', dataIndex: 'index', width: 80 });
    }
    return columns;
  });
  /** 已选区列 */
  const rightColumns = computed(() => {
    const colWidgets = defProps.widget.children?.[1] || [];
    const columns = colWidgets.map((widget) => {
      return {
        title: widget.alias,
        dataIndex: widget.props.field,
      };
    });
    if (serialNumber.value) {
      columns.unshift({ title: '序号', dataIndex: 'index', width: 80 });
    }
    const operationColumn = {
      dataIndex: 'action',
      title: t('sys.operation'),
      align: 'center',
      width: 80,
    };
    columns.push(operationColumn);
    return columns;
  });

  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(queryData?: QueryDataOptions) {
    let { pageNo, pageSize, query, exp, sorts } = Object.assign({}, pagination, queryData);

    lastQueryData.value = {
      query,
      pageNo,
      pageSize,
    };
    loading.value = true;
    try {
      let data = (await getDataSourceByType(lastQueryData.value)) as any;
      pagination.pageNo = data?.pageNo;
      pagination.pageSize = data?.pageSize;
      // pagination.exp = lastQueryData.value?.exp || '';
      pagination.query = lastQueryData.value?.query || {};
      total.value = data.totalCount;
      dataSource.value = transformSourceData(data.data, data.dict);
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }

  async function getDataSourceByType(queryData) {
    const isAssociation = txnType.value === 'em_txn_container_association';
    const containerIdByKey = isAssociation ? 'txn_subject_id_' : 'parent_container_id_';
    const action = isAssociation ? 'biz_go_association_search' : 'listByPage';
    const actionKey = isAssociation ? 'em_txn_container_association' : 'em_container';

    const res = await Event.context.$customBizService.post(
      {
        // @ts-ignore
        action,
        key: actionKey,
      },
      {
        ...queryData,
        query: {
          name_: searchName.value,
          [containerIdByKey]: containerFormData.value?.[refContainerField.value || 'id_'],
          ...queryData.query,
        },
      },
    );

    return res;
  }

  /** 通过名称过滤查询 */
  function handleSearchData() {
    getDataSource();
  }

  function handleTableChange(paginationInfo) {
    getDataSource({ pageNo: paginationInfo.current, ...paginationInfo });
  }

  function onSelectChange(record, selected) {
    if (selected) {
      selectedDataSource.value.unshift(record);
    } else {
      selectedDataSource.value = selectedDataSource.value.filter((d) => {
        return d.id_ !== record.id_;
      });
    }
    Event.runEventByName('onChange', defProps.widget.events, selectedDataSource.value);
  }

  function onSelectAllChange(selected) {
    if (selected) {
      dataSource.value.forEach((d) => {
        const find = selectedDataSource.value.find((row) => {
          return row.id_ === d.id_;
        });
        if (!find) {
          selectedDataSource.value.push(d);
        }
      });
    } else {
      dataSource.value.forEach((d) => {
        const index = selectedDataSource.value.findIndex((row) => {
          return row.id_ === d.id_;
        });
        if (index > -1) {
          selectedDataSource.value.splice(index, 1);
        }
      });
    }
    Event.runEventByName('onChange', defProps.widget.events, selectedDataSource.value);
  }

  function deleteSelectedRow(record) {
    selectedDataSource.value = selectedDataSource.value.filter((d) => {
      return d.id_ !== record.id_;
    });
    Event.runEventByName('onChange', defProps.widget.events, selectedDataSource.value);
  }

  function deleteAll() {
    selectedDataSource.value = [];
    Event.runEventByName('onChange', defProps.widget.events, selectedDataSource.value);
  }

  defineExpose({
    reset() {
      dataSource.value = [];
      selectedDataSource.value = [];
      searchName.value = undefined;
    },
    reload(queryData?) {
      getDataSource({ ...queryData });
    },
    getValue() {
      return selectedDataSource.value;
    },
  });
</script>

<style lang="scss" scoped>
  .table-wrap {
    padding: 16px;
    border-radius: 4px;
    // box-shadow: 0 0 8px 0 rgb(0 0 0 / 6%);
  }
  :deep(.ant-pagination) {
    position: relative;
    text-align: right;
  }
  :deep(.ant-pagination-total-text) {
    position: absolute;
    left: 0;
  }
</style>
