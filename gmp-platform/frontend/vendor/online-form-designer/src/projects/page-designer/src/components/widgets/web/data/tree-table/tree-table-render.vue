<template>
  <div ref="tableRef">
    <div
      class="data-table-header-container"
      v-if="
        fullScreen ||
        currentReload ||
        customHeader ||
        (rowSelection && checkboxRow.length) ||
        headerBtnGroup ||
        newRowSelection
      "
    >
      <div class="data-table-header_left">
        <div v-if="batchBtnGroup && checkboxRow.length > 0" class="batch-btn-group">
          <RenderTableButtons
            :visible-buttons="batchBtnGroup?.visibleButtons"
            :buttons="batchBtnGroup.children"
          />
        </div>
      </div>
      <div class="data-table-header_right">
        <div
          v-if="
            headerBtnGroupItems &&
            !(checkboxRow.length && batchBtnGroup && batchBtnGroup.children.length)
          "
          class="header-btn-group"
        >
          <RenderTableButtons
            :visible-buttons="headerBtnGroup?.visibleButtons"
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
          <!-- <fieldFilter
            class="text-20px"
            :columns="columnChildren"
            :cacheKey="cacheKey"
            @changeColumsByIds="changeColums"
          >
            <template #btn>
              <a-button v-if="customHeader" class="ml10px">
                <template #icon>
                  <span class="iconfont icon-shezhi"></span>
                </template>
              </a-button>
              <span v-else class="visible"></span>
            </template>
          </fieldFilter> -->
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
    </div>
    <a-form :model="formState" ref="formRef">
      <vxeRefTable
        ref="vxeTable"
        :tree-config="treeConfig"
        :height="tableHeight"
        :rowdraggable="rowdraggable"
        :loading="loading"
        v-model="datasource"
        :rowSelection="newRowSelection"
        :rowSelectionRadio="rowSelectionRadio"
        :operateColumn="operateColumn"
        :tableColumns="tableColumns"
        :radioDisabled="!radioRow"
        :serialNumber="serialNumber"
        :headerSort="widget.props.headerSort"
        @getDataSource="getDataSource"
        @radioEvent="radioEvent"
        @checkboxEvent="checkboxEvent"
        @cellClickEvent="cellClickEvent"
        @updateRowForm="updateRowForm"
        @titleSort="onTitleSort"
        :editMethods="editMethods"
        :visibleButtons="operateColumn?.props.visibleButtons"
        :validateByIndex="validateByIndex"
        isTree
        :tableFieldId="cacheKey"
        :levelHeaderGrouping="levelHeaderGrouping"
        :multiLevelHeader="multiLevelHeader"
        :selectTheEntireRow="selectTheEntireRow"
        :tableRowHeightNum="tableRowHeightNum"
      />
    </a-form>
  </div>
</template>

<script setup lang="ts" name="gct-tree-table">
  import { ref, reactive, toRaw, onMounted, toRef, nextTick, computed, provide } from 'vue';
  import { ListTreeSearchTypeEnum, tableColumnWidthEnum } from '/@page-designer/enum';
  import { selectionTypeEnums } from '/@/enums/appEnum';
  import { TreeTable } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import FullScreen from '/@/components/FullScreen/index.vue';
  import dataReload from '../../__components__/data_reload_button.vue';
  import { columnsType } from '../data-table/type';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { cloneDeep, merge, omit } from 'lodash-es';
  import { message as Message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isObject } from '/@/utils/is';
  import {
    ITreeTableComponentExpose,
    IDataTableQueryDataOptions as QueryDataOptions,
  } from '/@/projects/page-designer/src/interface/web';
  import { useTableEvents } from './transformHooks';
  import { transformButtons } from './transform';
  import {
    vxeRefTable,
    RenderTableButtons,
    fieldSortRender,
    useTableLayout,
  } from '../data-table/component/vxeRenderTable';
  import { TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

  const formRef = ref();
  const vxeTable = ref();
  const tableRef = ref();
  const radioRow = ref();
  const checkboxRow = ref<any[]>([]);
  const datasource = ref<any[]>([]);
  const props = defineProps<{ widget: TreeTable }>();
  const cacheKey = props.widget.id;
  const lastQueryData = ref({});
  const formState = computed(() => {
    return { [cacheKey]: datasource.value };
  });
  const { tableHeight } = useTableLayout(vxeTable, props.widget);
  const { t } = useI18n();
  const {
    rowdraggable,
    refSearch,
    model,
    modeldata,
    fullScreen,
    currentReload,
    customHeader,
    rowSelectionType,
    rowSelection,
    initializeLoad,
    datafilter,
    serialNumber,
    editMethods,
    defaultExpandLevel,
    multiLevelHeader,
    selectTheEntireRow,
    cellHeightMode,
    cellHeight,
  } = toRaw(props.widget.props);

  provide('tableCellHeight', { cellHeightMode, cellHeight });

  const levelHeaderGrouping = ref(props.widget.props.levelHeaderGrouping);
  /**多选标识 兼容老数据 */
  const newRowSelection = rowSelectionType === selectionTypeEnums.MultipleChoice || rowSelection;
  const rowSelectionRadio = rowSelectionType === selectionTypeEnums.SingleChoice;

  const columnChildren = props.widget.children![1].children;
  const operateColumn = toRef(() => {
    if (props.widget.children![0].children.length) {
      return props.widget.children![0];
    }
  });
  if (operateColumn.value?.id) {
    transformButtons(operateColumn.value?.children);
    operateColumn.value.id = undefined;
  }
  const treeConfig = reactive({
    transform: true,
    rowField: 'id_',
    parentField: 'parent_id_',
    lazy: true,
    hasChildField: 'hasChild',
    async loadMethod({ row }) {
      const data = await getDataSource({ parent_id_: row.id_ }, ListTreeSearchTypeEnum.CHILDREN);
      return data.map((i) => ({ ...i, hasChild: i.__NON_LEAF__ }));
    },
  });
  /**
   * tree 表格展开逻辑处理
   */
  async function transformExpandKeys(searchType: ListTreeSearchTypeEnum) {
    await nextTick();
    const treeTable = vxeTable.value.getXtable();
    treeTable.clearTreeExpand();
    datasource.value.forEach((i) => {
      if (
        searchType === ListTreeSearchTypeEnum.ALL ||
        searchType === ListTreeSearchTypeEnum.SEARCH
      ) {
        /**全展开和搜索 */
        treeTable.toggleTreeExpand(i);
        i.hasChild = false;
      } else if (
        !searchType ||
        searchType === ListTreeSearchTypeEnum.LEVEL ||
        searchType === ListTreeSearchTypeEnum.SEARCHALL
      ) {
        if (defaultExpandLevel === 0) {
          treeTable.toggleTreeExpand(i);
        } else {
          if (i.level_ < defaultExpandLevel) {
            treeTable.toggleTreeExpand(i);
          } else {
            i.hasChild = i.__NON_LEAF__;
          }
        }
      }
    });
  }

  /**字段排序 */
  const fieldSort = ref({ sortField: '', sortType: '' });
  const queryfilter = useQueryfilter(datafilter);
  const refSorts = computed(() => {
    if (fieldSort.value.sortType) {
      return [fieldSort.value];
    }
    return [];
  });

  const cacheColumns = ref<columnsType>();
  const tableColumns = toRef(() => {
    if (customHeader && cacheColumns.value) {
      return cacheColumns.value;
    } else {
      return columnChildren;
    }
  });
  const batchBtnGroup = toRef(() => {
    if (props.widget.children![3]?.children?.length) {
      return props.widget.children![3];
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

  const Event = getPageEvent();
  const loading = ref(false);

  const pagination = reactive<QueryDataOptions>({
    query: {},
    exp: '',
    sorts: [],
  });

  onMounted(async () => {
    await getBodyBySearchComponent(refSearch);
    /**
     * 初始化不加载
     */
    if (initializeLoad === false) return;
    // ListTreeSearchTypeEnum.LEVEL
    await search();
  });

  async function updateCacheColumn(options) {
    // console.log('updateCacheColumn', options);
    cacheColumns.value = options;
  }

  async function updateGroup(options) {
    // console.log('updateGroup', options);
    levelHeaderGrouping.value = options;
  }
  /**同步字段 */
  // function changeColums(list: string[]) {
  //   cacheColumns.value = [];
  //   list.forEach((id) => {
  //     const w = columnChildren.find((i) => i.id === id);
  //     w && cacheColumns.value.push(w);
  //   });
  // }

  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(queryData?: QueryDataOptions, searchType?: ListTreeSearchTypeEnum) {
    let { query = {}, exp, sorts = [], parent_id_ } = Object.assign({}, pagination, queryData);
    loading.value = true;
    let list = [];
    try {
      const treeParmse = {};
      if (
        searchType !== ListTreeSearchTypeEnum.CHILDREN &&
        (Object.values(omit(query, ['level_.le'])).filter((i) => i).length ||
          Object.keys(queryfilter.query)?.length)
      ) {
        searchType = ListTreeSearchTypeEnum.SEARCH;
      }
      let _searchType = searchType;
      if (searchType !== ListTreeSearchTypeEnum.ALL) {
        if (searchType === ListTreeSearchTypeEnum.LEVEL || !searchType) {
          if (defaultExpandLevel === 0) {
            _searchType = ListTreeSearchTypeEnum.ALL;
          } else {
            treeParmse['level_.le'] = defaultExpandLevel + 1;
          }
        } else if (searchType === ListTreeSearchTypeEnum.CHILDREN) {
          treeParmse['parent_id_.eq'] = parent_id_;
        }
      }

      lastQueryData.value = {
        searchType: _searchType || ListTreeSearchTypeEnum.LEVEL,
        query:
          _searchType !== 'CHILDREN'
            ? {
                ...query,
                ...queryfilter.query,
                ...treeParmse,
              }
            : { ...treeParmse },
        exp: queryfilter.getExp(exp),
        sorts: [...refSorts.value, ...sorts],
      };
      let data = (await Event.context.$httpBizService(
        { action: 'listTree', key: model, modelCategory: modeldata?.modelCategory },
        lastQueryData.value,
      )) as any;
      list = transformSourceData(data.data, data.dict) as any;
      if (searchType !== 'CHILDREN') {
        pagination.exp = lastQueryData.value?.exp || '';
        pagination.query = lastQueryData.value?.query || {};
        datasource.value = list;
        radioRow.value = '';
        transformExpandKeys(searchType);
      }
    } catch (error) {
      console.log(error);
    }
    loading.value = false;

    return list;
  }

  function onTitleSort(data: any) {
    fieldSort.value = data;
    search();
  }

  async function search(queryData?: QueryDataOptions) {
    let searchType = queryData?.searchType;
    if (Object.values(omit(queryData?.query, ['level_.le'])).filter((i) => i).length) {
      searchType = ListTreeSearchTypeEnum.SEARCH;
    }
    await getDataSource(queryData, searchType);
    merge(pagination, queryData || {});
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

  function radioEvent(value) {
    radioRow.value = value;
    Event.runEventByName('radioEvent', props.widget.events, cloneDeep(value));
  }
  function checkboxEvent(rows) {
    checkboxRow.value = rows;
    Event.runEventByName('checkboxEvent', props.widget.events, cloneDeep(rows));
  }
  function cellClickEvent(rows) {
    checkboxRow.value = rows;
    Event.runEventByName('cellClickEvent', props.widget.events, cloneDeep(rows));
  }

  /**设置查询条件 */
  function setParamsData(query?: object, paginationData: QueryDataOptions = {}) {
    if (typeof query !== 'object') return;
    for (let k in query) {
      pagination.query[k] = query[k];
    }
    for (let i in paginationData) {
      pagination[i] = paginationData[i];
    }
  }

  /**
   * 关闭编辑状态时候保存数据
   * @param formData
   */
  async function updateRowForm({ row, rowIndex }) {
    await validateByIndex(rowIndex);
    await Event.context.$httpBizService(
      {
        key: model,
        action: 'saveOrUpdate',
        modelCategory: modeldata?.modelCategory,
      },
      { ...row, _DICT: undefined, _OPCT: undefined },
    );
  }

  /**
   * 批量选中行根据Ids
   */
  async function deleteByChecked() {
    const ids = checkboxRow.value.map((i) => i.id_);
    const query = ids.reduce((total, curr, index) => {
      const key = 'full_path_.like:' + index;
      total[key] = curr;
      return total;
    }, {});
    const exp = `OR(${Object.keys(query).join(',')})`;
    await Event.context.$httpBizService(
      { key: model, action: 'remove', modelCategory: modeldata?.modelCategory },
      { exp, query },
    );
    Message.success(t('sys.delSuccess'));
    getDataSource();
  }

  /**根据索引校验 */
  async function validateByIndex(rowIndex) {
    const nameList = tableColumns.value
      .filter((i) => i.props.field)
      .map((i) => {
        return [cacheKey, rowIndex, i.props.field];
      });
    await formRef.value.validateFields(nameList);
  }
  /**注入的方法给按钮组件使用使用 */
  // provide('tableEvent', {
  //   deleteByChecked,
  //   afterImport: async () => {
  //     getDataSource();
  //   },
  //   getParameters: () => {
  //     return cloneDeep(lastQueryData.value);
  //   },
  // });

  const tableRowHeightNum = computed(() => {
    const { cellHeightMode, cellHeight } = props.widget.props;
    if (!cellHeightMode) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW) return cellHeight || 10;
    return -1;
  });

  useTableEvents({
    getDataSource,
    Event,
    deleteByChecked,
    getParameters() {
      return cloneDeep(lastQueryData.value);
    },
    modeldata,
    model,
  });

  defineExpose<ITreeTableComponentExpose>({
    setDataSource(data, dict) {
      const options = transformSourceData(data, dict);
      datasource.value = options;
    },
    reload: search,
    setParamsData,
    getSelectedValue() {
      if (rowSelectionType === selectionTypeEnums.MultipleChoice) {
        return checkboxRow.value;
      } else {
        toRaw(radioRow.value);
      }
    },
    addDataSource(data, dict) {
      isObject(data) && (data = [data]);
      const options = transformSourceData(data, dict);
      datasource.value.push(...options);
    },
    deleteByChecked,
    validateByIndex,
    async fullValidate() {
      await formRef.value.validate();
    },
  });
</script>
<style scoped lang="scss">
  .data-table-header-container {
    display: flex;
    justify-content: space-between;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .header-btn-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
