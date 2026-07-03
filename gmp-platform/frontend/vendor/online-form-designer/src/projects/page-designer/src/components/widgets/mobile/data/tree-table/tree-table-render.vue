<template>
  <vxeRefTable
    ref="vxeTable"
    keyField="id_"
    :serialNumber="serialNumber"
    :rowdraggable="rowdraggable"
    :loading="loading"
    :datasource="datasource"
    :cacheColumns="widget.children"
    @getDataSource="getDataSource"
    @cellClickEvent="cellClickEvent"
    :tree-config="treeConfig"
    :rowSelectionType="rowSelectionType"
    :rowSelection="!!rowSelection"
    :height="height"
    @radioEvent="radioEvent"
    @checkboxEvent="checkboxEvent"
    isTree
  />
</template>

<script setup lang="ts" name="gct-tree-table">
  import { ref, reactive, toRaw, onMounted, toRef, nextTick, computed } from 'vue';
  import { TreeTableMobile } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import vxeRefTable from '../data-table/component/vxeRefTable/index.vue';
  import { QueryDataOptions } from '../data-table/type';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { tableColumnWidthEnum, ListTreeSearchTypeEnum } from '/@page-designer/enum';
  import { cloneDeep, merge } from 'lodash-es';
  import { selectionTypeEnums } from '/@/enums/appEnum';
  import { isObject } from '/@/utils/is';
  import { IMobTreeTableComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ widget: TreeTableMobile }>();
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
    defaultExpandLevel,
  } = toRaw(props.widget.props);
  const { tableheight, tableheightConfigure } = toRaw(props.widget.style);
  const height = toRef(() => {
    if (tableheightConfigure === tableColumnWidthEnum.ENUMERATION) {
      return tableheight;
    }
  }); /**选中的单选项 */

  console.log(props.widget.props);

  // 是否开启数据选择
  const rowSelection = computed(() => {
    return props.widget.props.rowSelection;
  });
  // 数据选择模式
  const rowSelectionType = computed(() => {
    return props.widget.props.rowSelectionType;
  });
  const radioRow = ref();
  let checkboxRow: any[] = [];
  const querySort = getQuerySort({ collationField, collationSort, collation });
  const queryfilter = useQueryfilter(datafilter);
  const vxeTable = ref();
  const datasource = ref([]);
  const Event = getPageEvent();
  const loading = ref(false);

  const pagination = reactive<QueryDataOptions>({
    query: {},
    exp: '',
    sorts: [],
  });

  Event.initSearchs(refSearch, search, props.widget.id);
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
  onMounted(async () => {
    await getBodyBySearchComponent(refSearch);
    /**
     * 初始化不加载
     */
    if (initializeLoad === false) return;

    await getDataSource();
  });

  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(
    queryData?: QueryDataOptions,
    searchType: ListTreeSearchTypeEnum = ListTreeSearchTypeEnum.LEVEL,
  ) {
    let { query = {}, exp, sorts = [], parent_id_ } = Object.assign({}, pagination, queryData);
    loading.value = true;
    let list = [];
    try {
      const treeParmse = {};
      if (Object.keys(query)?.length || Object.keys(queryfilter.query)?.length) {
        searchType = ListTreeSearchTypeEnum.SEARCH;
      } else if (searchType === ListTreeSearchTypeEnum.LEVEL) {
        if (defaultExpandLevel === 0) {
          searchType = ListTreeSearchTypeEnum.ALL;
        } else {
          treeParmse['level_.le'] = defaultExpandLevel + 1;
        }
      } else if (searchType === ListTreeSearchTypeEnum.CHILDREN) {
        treeParmse['parent_id_.eq'] = parent_id_;
      }
      let data = (await Event.context.$httpBizService(
        { action: 'listTree', key: model, modelCategory: modeldata?.modelCategory },
        {
          searchType,
          query: {
            ...query,
            ...queryfilter.query,
            ...treeParmse,
          },
          exp: queryfilter.getExp(exp),
          sorts: [...sorts, ...querySort],
        },
      )) as any;
      pagination.query = query;
      list = transformSourceData(data.data, data.dict) as any;
      if (searchType !== 'CHILDREN') {
        datasource.value = list;
        transformExpandKeys(searchType);
      }
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
    return list;
  }

  async function search(queryData?: QueryDataOptions) {
    datasource.value = [];
    await getDataSource(queryData);
    merge(pagination, queryData || {});
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
      } else if (searchType === ListTreeSearchTypeEnum.LEVEL) {
        if (i.level_ < defaultExpandLevel) {
          treeTable.toggleTreeExpand(i);
        } else {
          i.hasChild = i.__NON_LEAF__;
        }
      }
    });
  }
  defineExpose<IMobTreeTableComponentExpose>({
    reload: search,
    setParamsData,
    getSelectedValue() {
      if (rowSelectionType.value === selectionTypeEnums.MultipleChoice) {
        return checkboxRow;
      } else {
        toRaw(radioRow.value);
      }
    },
    addDataSource(data, dict) {
      isObject(data) && (data = [data]);
      const options = transformSourceData(data, dict);
      datasource.value.push(...options);
    },
  });
</script>
