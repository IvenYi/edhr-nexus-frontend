<template>
  <div ref="tableRef" class="bg-[#fff]">
    <div
      class="table-header-container"
      v-if="fullScreen || currentReload || customHeader || headerBtnGroup"
    >
      <div v-if="headerBtnGroupItems" class="header-btn-group">
        <RenderTableButtons
          :visible-buttons="headerBtnGroup?.props?.visibleButtons"
          :buttons="headerBtnGroupItems"
          reverse
        />
      </div>
      <div class="ks-row-middle p10px" v-if="fullScreen || currentReload || customHeader">
        <div class="ks-col"></div>
        <a-button v-if="fullScreen && tableRef">
          <template #icon> <FullScreen :el="tableRef" /></template>
        </a-button>
        <a-button v-if="currentReload" @click="getDataSource()" class="ml10px">
          <template #icon> <dataReload class="text-20px" /></template>
        </a-button>
        <!-- <a-button v-if="customHeader" class="ml10px">
          <template #icon>
            <fieldFilter
              class="text-20px"
              :columns="columnChildren"
              :cacheKey="cacheKey"
              @changeColumsByIds="changeColums"
          /></template>
        </a-button> -->
        <fieldSortRender
          v-if="customHeader"
          :cacheKey="cacheKey"
          :headerGrouping="levelHeaderGrouping"
          :multiLevelHeader="!!multiLevelHeader"
          :columns="columnChildren"
          @reloadColumn="updateCacheColumn"
          @reloadGroup="updateGroup"
        >
          <a-button class="ml10px">
            <template #icon>
              <span class="iconfont icon-shezhi"></span>
            </template>
          </a-button>
        </fieldSortRender>
      </div>
    </div>
    <div class="rdo-table-area">
      <vxeRefTable
        ref="vxeTable"
        :tree-config="treeConfig"
        :height="tableHeight"
        :loading="loading"
        v-model="datasource"
        :tableColumns="tableColumns"
        :serialNumber="serialNumber"
        :headerSort="widget.props.headerSort"
        @getDataSource="getDataSource"
        @cellClickEvent="cellClickEvent"
        @titleSort="onTitleSort"
        :exp="exp"
        isTree
        :operateColumn="operateColumn"
        :seqMethod="seqMethod"
        :levelHeaderGrouping="levelHeaderGrouping"
        :multiLevelHeader="multiLevelHeader"
      >
        <template #field="{ widget, row, rowIndex }">
          <div
            v-if="
              (widget.props.parentField && !row.version_) ||
              (row.version_ && !widget.props.parentField) ||
              widget.type === 'rdo-input'
            "
            class="ks-row items-center w100% pt7px pb7px!"
          >
            <table-cell
              class="ell w100% "
              :widget="widget"
              :rowValue="row"
              :index="rowIndex"
              :rowReadonly="true"
            />
            <MultiFieldDisplay
              v-if="row.version_ && !widget.props.parentField"
              :widget="widget"
              :rowValue="row"
              :rowReadonly="widget.props.readonly"
              :isDesign="props.isDesign"
            />
          </div>

          <span v-else></span>
        </template>
        <template #operate="{ row, rowIndex }">
          <RenderTableColunmButtons
            v-if="!row.base_id_"
            :tableForm="row"
            :buttons="parentdata!.children"
            :visible-buttons="parentdata!.props.visibleButtons"
            :rowIndex="rowIndex"
          />
          <RenderTableColunmButtons
            v-else
            :tableForm="row"
            :buttons="childrendata!.children"
            :visible-buttons="childrendata!.props.visibleButtons"
            :rowIndex="rowIndex"
          />
        </template>
      </vxeRefTable>
    </div>
    <div class="text-right mt10px" v-if="datasource.length">
      <a-pagination
        v-bind="paginationAttr"
        @change="showSizeChange"
        class="pagination-total-left"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, toRef, nextTick } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import {
    transformSourceData,
    transformData,
  } from '/@page-designer/components/widgets/hooks/utils';
  import FullScreen from '/@/components/FullScreen/index.vue';
  import {
    RenderTableColunmButtons,
    vxeRefTable,
    dataReload,
    fieldFilter,
    tableCell,
    fieldSortRender,
    useTableLayout,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { cloneDeep, merge } from 'lodash-es';
  import { message as Message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isObject } from '/@/utils/is';
  import { RenderTableButtons } from '/@page-designer/components/widgets/web/data/data-table/component/render-table-buttons/render-table-buttons';
  import { ITxnDataCollection } from './schema';
  import { useTableEvents } from './transformHooks';
  import { transformButtons } from './transform';
  import MultiFieldDisplay from '../../../../components/widgets/web/__components__/formcomponent/field-label/muti-field-display.vue';

  export interface QueryDataOptions {
    query: object;
    pageNo?: number;
    pageSize?: number;
    sorts?: { sortfield: string; sortType: 'asc' | 'desc' }[];
    exp?: string;
  }
  const vxeTable = ref();
  const tableRef = ref();
  const datasource = ref<any[]>([]);
  const props = defineProps<{ widget: ITxnDataCollection }>();
  const cacheKey = ref(props.widget.id);
  const { tableHeight } = useTableLayout(vxeTable, props.widget);
  const { t } = useI18n();
  const {
    refSearch,
    model,
    modeldata,
    fullScreen,
    currentReload,
    customHeader,
    initLoad,
    collation,
    serialNumber,
    pageSize,
    datafilter,
    exp,
    defaultExpand,
    multiLevelHeader,
    rdoUniqueFieldKey,
  } = <Required<ITxnDataCollection['props']>>props.widget.props;
  const levelHeaderGrouping = ref(props.widget.props.levelHeaderGrouping);
  const total = ref(0);
  /**字段排序 */
  const fieldSort = ref({ sortField: '', sortType: '' });
  /**接口排序 */
  const querySort = getQuerySort({ collation });
  const refSorts = computed(() => {
    if (fieldSort.value.sortType) {
      return [fieldSort.value];
    }
    return querySort ?? [];
  });
  const pagination = reactive<Required<QueryDataOptions>>({
    query: {},
    pageSize: pageSize,
    pageNo: 1,
    exp: '',
    sorts: [],
  });
  const pageSizeOptions = [10, 20, 30, 40, 50];
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
  const columnChildren = props.widget.children[1].children;
  const operateColumn = computed(() => {
    if (!!props.widget.children[0]?.children.map((i) => i.children)?.flat()?.length) {
      return props.widget.children[0];
    }
  });
  const parentdata = operateColumn.value?.children?.[0];
  const childrendata = operateColumn.value?.children?.[1];
  if (operateColumn.value && !operateColumn.value.renewal) {
    transformButtons(parentdata.children);
    transformButtons(childrendata.children);
    operateColumn.value.renewal = true;
  }

  const treeConfig = {
    transform: true,
    rowField: 'id_',
    parentField: 'base_id_',
    expandAll: true,
  };
  /**数据筛选 */
  const queryfilter = useQueryfilter(datafilter);
  const cacheColumns = ref();
  const tableColumns = computed(() => {
    if (customHeader && cacheColumns.value) {
      return cacheColumns.value;
    } else {
      return columnChildren;
    }
  });
  const headerBtnGroup = toRef(() => {
    if (props.widget.children![2]?.children?.length) {
      return props.widget.children![2];
    }
  });
  const headerBtnGroupItems = computed(() => {
    if (props.widget.children![2]?.children?.length) {
      return props.widget.children![2].children;
    }
    return null;
  });
  const lastQueryData = ref<Partial<QueryDataOptions>>({});
  const Event = getPageEvent();
  const loading = ref(false);
  /**分页 */
  function showSizeChange(current, pageSize) {
    getDataSource({ pageNo: current, pageSize });
  }
  onMounted(async () => {
    await getBodyBySearchComponent(refSearch);
    if (initLoad) {
      await getDataSource();
    }
  });

  async function updateCacheColumn(options) {
    // console.log('updateCacheColumn', options);
    cacheColumns.value = options;
  }

  async function updateGroup(options) {
    // console.log('updateGroup', options);
    levelHeaderGrouping.value = options;
  }

  // /**同步字段 */
  // function changeColums(list: string[]) {
  //   cacheColumns.value = [];
  //   list.forEach((id) => {
  //     const w = columnChildren.find((i) => i.id === id);
  //     w && cacheColumns.value.push(w);
  //   });
  // }

  /**序号计算逻辑 */
  function seqMethod({ row }) {
    return row.__SEQ__;
  }
  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(queryData?: Partial<QueryDataOptions>) {
    let { pageNo, pageSize, sorts = [], query, exp } = Object.assign({}, pagination, queryData);
    // console.log(pagination, queryData);
    lastQueryData.value = {
      query: { ...query, ...queryfilter.query },
      exp: queryfilter.getExp(exp),
      pageNo,
      pageSize,
      sorts: [...refSorts.value, ...sorts],
    };
    loading.value = true;
    try {
      let data = await Event.context.$httpBizService(
        {
          action: 'rdoListByPage',
          key: model,
          modelCategory: modeldata?.modelCategory,
        },
        { ...lastQueryData.value },
      );
      pagination.pageSize = pageSize;
      pagination.pageNo = pageNo;
      pagination.exp = lastQueryData.value?.exp || '';
      pagination.query = lastQueryData.value?.query || {};
      total.value = data?.totalCount;
      const seq = (pageNo - 1) * pageSize;
      const rdodata = data?.data
        ?.map((i, index) => {
          const __SEQ__ = seq + index + 1;
          const __CHILDREN__ =
            i.__CHILDREN__?.map((c, cindex) => ({
              ...c,
              __SEQ__: `${__SEQ__}.${cindex + 1}`,
            })) || [];
          const DEFAULT = __CHILDREN__.find((i) => i.default_);
          return [
            { ...i, __DEFAULT__: transformData(DEFAULT, data.dict), __SEQ__ },
            ...__CHILDREN__,
          ];
        })
        .flat();
      datasource.value = transformSourceData(rdodata, data.dict);
    } catch (error) {
      console.log(error);
    }
    await nextTick();
    loading.value = false;
    const treeTable = vxeTable.value.getXtable();
    if (!defaultExpand) {
      setTimeout(() => {
        treeTable.clearTreeExpand();
      }, 0);
    } else {
      treeTable.setAllTreeExpand(true);
    }
  } /**分页 */

  function onTitleSort(data: any) {
    if (data.sortField === 'table_name_') {
      data.sortField = rdoUniqueFieldKey || 'name_';
    }
    fieldSort.value = data;
    search();
  }

  async function search(queryData?: QueryDataOptions) {
    await getDataSource(queryData);
  }

  async function getBodyBySearchComponent(key: string) {
    if (!key) return {};
    Event.initSearchs(key, search, props.widget.id);
    try {
      let searchVm = (await Event.getSyncComponent(key)) as any;
      let queryData = (await searchVm.getBodyBySearch()) || {};
      merge(pagination, queryData);
    } catch (error) {}
  }

  function cellClickEvent(rows) {
    Event.runEventByName('cellClickEvent', props.widget.events, cloneDeep(rows));
  }

  function getParameters() {
    return cloneDeep(lastQueryData.value);
  }
  useTableEvents({ Event, getDataSource, getParameters, modeldata, model });
  defineExpose({
    getParameters,
    reload: search,
    addDataSource(data, dict) {
      isObject(data) && (data = [data]);
      const options = transformSourceData(data, dict);
      datasource.value.push(...options);
    },
  });
</script>
<style lang="scss" scoped>
  .table-header-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
  }

  .header-btn-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.vxe-table--render-default .vxe-tree-cell) {
    .select-text {
      line-height: 1.2 !important;
    }
  }
</style>
