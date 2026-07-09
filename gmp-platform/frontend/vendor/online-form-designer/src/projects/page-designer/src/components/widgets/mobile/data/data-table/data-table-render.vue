<template>
  <div ref="tableRef">
    <vxeRefTable
      :serialNumber="serialNumber"
      :rowdraggable="rowdraggable"
      :loading="loading"
      :datasource="datasource"
      :cacheColumns="widget.children"
      :max-height="widget.style.maxHeight"
      @getDataSource="getDataSource"
      @cellClickEvent="cellClickEvent"
      @nextPage="nextPage"
      :rowSelection="!!rowSelection"
      :rowSelectionType="rowSelectionType"
      @radioEvent="radioEvent"
      @checkboxEvent="checkboxEvent"
    />
  </div>
</template>

<script setup lang="ts" name="gct-data-table">
  import { ref, reactive, toRaw, onMounted, toRef } from 'vue';
  import { DataTable } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import vxeRefTable from './component/vxeRefTable/index.vue';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { isObject } from '/@/utils/is';
  import { cloneDeep, merge } from 'lodash-es';
  import { selectionTypeEnums } from '/@/enums/appEnum';
  import {
    IDataTableComponentExpose,
    IDataTableQueryDataOptions,
  } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ widget: DataTable }>();
  /**选中的单选项 */
  const radioRow = ref();
  let checkboxRow: any[] = [];
  const {
    rowdraggable,
    refSearch,
    model,
    modeldata,
    initializeLoad,
    collationField,
    collationSort,
    collation,
    datafilter,
    serialNumber,
    customdataSource,
    datasourceConfig,
  } = toRaw(props.widget.props);
  const querySort = getQuerySort({ collationField, collationSort, collation });
  const queryfilter = useQueryfilter(datafilter);
  const foreignFields =
    props.widget.children
      .filter((i) => i.props.isFieldModel)
      .map((i) => i.props.bindFieldLink?.join('.')) || [];
  // 是否开启数据选择
  const rowSelection = toRef(() => {
    return props.widget.props.rowSelection;
  });
  // 数据选择模式
  const rowSelectionType = toRef(() => {
    return props.widget.props.rowSelectionType;
  });

  const datasource = ref([]);
  const Event = getPageEvent();
  const total = ref(0);
  const loading = ref(false);
  const lastQueryData = ref<IDataTableQueryDataOptions>({} as any);
  const pagination = reactive<IDataTableQueryDataOptions>({
    pageSize: 20,
    pageNo: 1,
    query: {},
    exp: '',
    sorts: [],
    foreignFields: [],
  });

  Event.initSearchs(refSearch, search, props.widget.id);

  onMounted(async () => {
    await getBodyBySearchComponent(refSearch);
    /**
     * 初始化不加载
     */
    if (initializeLoad === false) return;

    await getDataSource();
  });
  /**
   * 支持自定义数据源
   * @param queryData
   */
  async function getDataSourceByType(queryData: IDataTableQueryDataOptions) {
    if (customdataSource && datasourceConfig?.name) {
      return Event.runExportByName(datasourceConfig?.name, queryData, datasourceConfig.extraParams);
    } else {
      return Event.context.$httpBizService(
        { action: 'listByPage', key: model, modelCategory: modeldata?.modelCategory },
        queryData,
      );
    }
  }
  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(queryData?: IDataTableQueryDataOptions) {
    let { pageNo, pageSize, query, exp, sorts } = Object.assign({}, pagination, queryData);
    loading.value = true;
    lastQueryData.value = {
      query: { ...query, ...queryfilter.query },
      exp: queryfilter.getExp(exp),
      pageNo,
      pageSize,
      sorts: [...sorts, ...querySort],
      foreignFields,
    };
    try {
      let data = (await getDataSourceByType(lastQueryData.value)) as any;
      pagination.pageNo = data.pageNo;
      pagination.pageSize = data.pageSize;
      total.value = data.totalCount;
      let newdata = transformSourceData(data.data, data.dict);
      datasource.value.push(...newdata);
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }
  function nextPage() {
    /**
     * 初始化不加载 懒加载也关闭
     */
    if (initializeLoad === false) return;
    pagination.pageNo++;
    getDataSource();
  }
  async function search(queryData?: IDataTableQueryDataOptions) {
    datasource.value = [];
    await getDataSource(queryData);
    pagination.exp = queryData?.exp || '';
    pagination.query = queryData?.query || {};
  }
  async function getBodyBySearchComponent(key: string) {
    if (!key) return {};
    try {
      let search = (await Event.getSyncComponent(key)) as any;
      let queryData = (await search.getBodyBySearch()) || {};
      merge(pagination, queryData);
    } catch (error) {}
  }
  function radioEvent(value) {
    radioRow.value = value;
    Event.runEventByName('radioEvent', props.widget.events, cloneDeep(value));
  }
  function checkboxEvent(rows) {
    checkboxRow = rows;
    Event.runEventByName('checkboxEvent', props.widget.events, cloneDeep(rows));
  }
  function cellClickEvent(rows) {
    Event.runEventByName('cellClickEvent', props.widget.events, rows);
  }

  /**设置查询条件 */
  function setParamsData(query?: object, paginationData: Partial<IDataTableQueryDataOptions> = {}) {
    if (typeof query !== 'object') return;
    for (let k in query) {
      pagination.query[k] = query[k];
    }
    for (let i in paginationData) {
      pagination[i] = paginationData[i];
    }
  }

  defineExpose<IDataTableComponentExpose>({
    reload(queryData = {}) {
      pagination.pageNo = 1;
      search(queryData as any);
    },
    setParamsData,
    addDataSource(data, dict) {
      isObject(data) && (data = [data]);
      const options = transformSourceData(data, dict);
      datasource.value.push(...options);
    },
    setDataSource(data = [], dict) {
      const options = transformSourceData(data, dict);
      datasource.value = options;
    },
    getDataSource() {
      return cloneDeep(datasource.value);
    },
    getSelectedValue() {
      if (rowSelectionType.value === selectionTypeEnums.MultipleChoice) {
        return cloneDeep(checkboxRow);
      } else {
        return cloneDeep(radioRow.value);
      }
    },
    getParameters() {
      return cloneDeep(lastQueryData.value);
    },
  });
</script>
<style lang="less">
  .vxe-table--render-default .vxe-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
