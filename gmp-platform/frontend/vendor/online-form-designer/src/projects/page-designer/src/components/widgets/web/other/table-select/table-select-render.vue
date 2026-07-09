<template>
  <div>
    <search-render
      v-if="showSearch"
      ref="searchRef"
      :widget="searchWidget"
      :refParentModelkey="refParentModelkey"
    />
    <a-row :gutter="[12, 0]" class="table-select-wrap mt16px">
      <a-col :span="rowSelectionType === RowSelectionTypeEnums.MultipleChoice ? 12 : 24">
        <div class="to-selected-box">
          <div class="table-wrap">
            <div class="text-[#000000] text-14px mb8px">
              <span class="title-icon mr12px"></span>
              {{ t('sys.pageDesigner.ToBeSelect') }}
            </div>
            <vxeRefTable
              :height="widget.style.height"
              ref="table"
              :loading="loading"
              v-model="dataSource"
              :rowSelection="rowSelectionType === RowSelectionTypeEnums.MultipleChoice"
              :rowSelectionRadio="rowSelectionType === RowSelectionTypeEnums.SingleChoice"
              :tableColumns="tableColumns"
              :serialNumber="serialNumber"
              :seqMethod="seqMethod"
              :border="false"
              :row-class-name="rowClassName"
              @getDataSource="getDataSource"
              @onSelectChange="({ row, checked }) => onSelectChange({ row, checked })"
              @onSelectAllChange="({ checked }) => onSelectAllChange({ checked })"
              :searchType="TableSearchTypeEnum.EXTERNAL"
              :selectTheEntireRow="selectTheEntireRow"
              :tableRowHeightNum="tableRowHeightNum"
              :cellHeaderHeightSync="cellHeaderHeightSync"
            />
            <div class="text-right mt16px" v-if="showPagination">
              <a-pagination
                v-bind="paginationAttr"
                class="pagination-total-left"
                @change="(page, pageSize) => getDataSource({ pageNo: page, pageSize })"
              />
            </div>
          </div>
        </div>
      </a-col>
      <a-col
        :span="12"
        class="be-selected-box-col"
        v-if="rowSelectionType === RowSelectionTypeEnums.MultipleChoice"
      >
        <div class="be-selected-box">
          <div class="table-wrap">
            <div class="text-[#000000] text-14px mb8px">
              <span class="title-icon mr12px"></span>
              {{ t('sys.pageDesigner.beSelected') }}
            </div>
            <vxeRefTable
              :height="widget.style.height"
              v-model="selectedDataSource"
              :tableColumns="tableColumns"
              :operateColumn="widget.children[2]"
              :serialNumber="serialNumber"
              :border="false"
              :tableRowHeightNum="tableRowHeightNum"
              :selectTheEntireRow="selectTheEntireRow"
              :cellHeaderHeightSync="cellHeaderHeightSync"
            >
              <template #operate="{ row }">
                <a-button type="link" danger @click="deleteRow(row)">{{
                  t('sys.delete')
                }}</a-button>
              </template>
            </vxeRefTable>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="gct-table-select">
  import { computed, onMounted, reactive, ref, toRaw, toRef, nextTick, provide } from 'vue';
  import { TableSelect } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SearchRender from '/@page-designer/components/widgets/web/other/query/search-render.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { RowSelectionTypeEnums, TableSearchTypeEnum } from '/@page-designer/enum';
  import vxeRefTable from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable/index.vue';
  // import { useDisplayRuleOptions } from '/@web-render/render/Event/utils/displayRule';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import {
    ITableSelectComponentExpose,
    ITableSelectQueryDataOptions as QueryDataOptions,
  } from '/@/projects/page-designer/src/interface/web';
  import { TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

  const Event = getPageEvent();
  const searchRef = ref(null);
  const dataSource = ref<any[]>([]);
  const selectedDataSource = ref<any[]>([]);
  const { t } = useI18n();
  const loading = ref(false);
  const table = ref();
  const props = defineProps<{
    widget: TableSelect;
  }>();
  const {
    model,
    modeldata,
    showPagination,
    pageSize,
    datafilter,
    collationField,
    collationSort,
    collation,
    rowSelectionType,
    initNotLoad,
    initLoad,
    index: serialNumber,
    refParentModelkey,
    customdataSource,
    datasourceConfig,
    selectTheEntireRow,
    cellHeightMode,
    cellHeight,
    cellHeaderHeightSync,
  } = toRaw(props.widget.props);
  provide('tableCellHeight', { cellHeightMode, cellHeight, cellHeaderHeightSync });

  const showSearch = toRaw(props.widget.props.search);
  const querySort = getQuerySort({ collationField, collationSort, collation });
  const queryfilter = useQueryfilter(datafilter);
  const tableColumns = props.widget.children![1].children;
  const searchWidget = computed(() => {
    return props.widget.children![0];
  });
  const selectedKeys = computed(() => {
    return selectedDataSource.value.map((d) => d.id_);
  });
  const paginationAttr = computed(() => {
    return {
      current: queryData.pageNo,
      pageSize: queryData.pageSize,
      total: queryData.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

  const queryData = reactive<Required<QueryDataOptions>>({
    pageSize: pageSize,
    pageNo: 1,
    total: 0,
    query: {},
    exp: '',
    sorts: [],
  });
  Event.initSearchs(searchWidget.value?.id!, searchFunc, props.widget.id);
  onMounted(() => {
    if (initLoad === false || initNotLoad === true) {
      return;
    }
    getDataSource(queryData);
  });
  async function searchFunc(queryParam?: QueryDataOptions) {
    await getDataSource(queryParam);
  }
  /**
   * 支持自定义数据源
   * @param queryData
   */
  async function getDataSourceByType(queryData: QueryDataOptions) {
    if (customdataSource && datasourceConfig?.name) {
      return Event.runExportByName(datasourceConfig?.name, queryData, datasourceConfig.extraParams);
    } else {
      return Event.context.$httpBizService(
        {
          action: showPagination ? 'listByPage' : 'listAll',
          key: model,
          modelCategory: modeldata?.modelCategory,
        },
        queryData,
      );
    }
  }
  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(queryParam?: QueryDataOptions) {
    let { pageNo, pageSize, query, exp } = Object.assign({}, queryData, queryParam);
    loading.value = true;
    try {
      const apidata = {
        query: { ...query, ...queryfilter.query },
        exp: queryfilter.getExp(exp),
        pageNo,
        pageSize,
        sorts: [...querySort],
      };
      let data = (await getDataSourceByType(apidata)) as any;
      queryData.pageNo = data.pageNo;
      queryData.pageSize = data.pageSize;
      queryData.query = query;
      queryData.exp = exp;
      queryData.total = data.totalCount;
      dataSource.value = transformSourceData(data.data, data.dict);
      table.value.setSeleckedByKeys('id_', selectedKeys.value);
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }

  const onSelectChange = ({ row, checked }) => {
    //checked为ture则是选中  false为取消选中
    if (checked) {
      if (rowSelectionType === RowSelectionTypeEnums.MultipleChoice) {
        selectedDataSource.value.unshift(row);
      } else {
        selectedDataSource.value = [row];
      }
    } else {
      if (rowSelectionType === RowSelectionTypeEnums.MultipleChoice) {
        selectedDataSource.value = selectedDataSource.value.filter((d) => {
          return d.id_ !== row.id_;
        });
      } else {
        selectedDataSource.value = [];
      }
    }
    // selectedRowKeys.value = selectedKeys;
    // selectedDataSource.value = selectedRows;
  };

  const onSelectAllChange = ({ checked }) => {
    if (checked) {
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
  };
  const deleteRow = (row) => {
    selectedDataSource.value = selectedDataSource.value.filter((d) => {
      return d.id_ !== row.id_;
    });
    table.value.setSeleckedByKeys('id_', selectedKeys.value);
    // selectedRowKeys.value = selectedRowKeys.value.filter((d) => d !== row.id_);
    // selectedDataSource.value = selectedDataSource.value.filter((d: any) => d.id_ !== row.id_);
  };

  /**序号计算逻辑 */
  function seqMethod({ rowIndex }) {
    if (!showPagination) return rowIndex + 1;
    const start = rowIndex + 1;
    return (queryData.pageNo - 1) * queryData.pageSize + start;
  }

  //表格选中行的样式
  const rowClassName = (record) => {
    if (selectedDataSource.value.some((e) => e.id_ === record.row.id_)) return 'gct-current-row';
    else return '';
  };

  const tableRowHeightNum = computed(() => {
    const { cellHeightMode, cellHeight } = props.widget.props;
    if (!cellHeightMode) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW) return cellHeight || 10;
    return -1;
  });

  defineExpose<ITableSelectComponentExpose>({
    search: () => {
      searchRef.value && searchRef.value.search();
    },
    async setValueBySearch(obj) {
      await nextTick();
      searchRef.value && searchRef.value.setValueBySearch(obj);
    },
    reload: getDataSource,
    getValue: ({ option } = { option: false }) => {
      return option ? toRaw(selectedDataSource.value) : toRaw(selectedKeys.value);
    },
    setValue: async (selectedKeys = []) => {
      if (!selectedKeys.length) {
        selectedDataSource.value = [];
        table.value.setSeleckedByKeys('id_', []);
        return;
      }
      let data = await Event.context.$httpBizService(
        { action: 'listByIds', key: model, modelCategory: modeldata?.modelCategory },
        { ids: selectedKeys.join(',') },
      );
      selectedDataSource.value = transformSourceData(data.data, data.dict);
      table.value.setSeleckedByKeys('id_', selectedKeys);
    },
  });
</script>

<style lang="less" scoped>
  .to-selected-box {
    // padding-top: 12px;
    // padding-right: 7px;
  }

  .be-selected-box {
    // padding-top: 12px;
    // padding-left: 7px;
  }

  .tag {
    margin: 0;
    margin-bottom: 12px;
    margin-left: 12px;
    border-radius: 0;
  }

  .be-selected-box-col::before {
    // content: '';
    // display: block;
    // position: absolute;
    // width: 1px;
    // height: 100%;
    // background-color: #eaeaea;
  }

  :deep(.ant-pagination) {
    // margin: 10px 0 0;
  }

  .table-select-wrap {
    // background-color: #fff;
  }

  .table-wrap {
    padding: 16px;
    border-radius: 4px;
    box-shadow: 0 0 8px 0 rgb(0 0 0 / 6%);
  }

  .title-icon {
    display: inline-block;
    position: relative;
    top: 1px;
    width: 2px;
    height: 12px;
    background-color: var(--ant-primary-color);
  }
</style>
