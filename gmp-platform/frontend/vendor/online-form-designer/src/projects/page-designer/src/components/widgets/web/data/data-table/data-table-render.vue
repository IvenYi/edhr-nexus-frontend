<template>
  <div
    ref="tableRef"
    :class="{
      'bg-[#fff]': true,
      'data-table-render': true,
      [widget.props.gridType]: true,
      'is-enable-select': newRowSelection,
    }"
    class="rounded-4px"
  >
    <div
      class="table-header-container"
      v-if="
        fullScreen ||
        currentReload ||
        customHeader ||
        productionScheduling ||
        batchBtnGroup ||
        headerBtnGroup ||
        (newRowSelection && checkboxRow.length)
      "
      :class="!!parentData ? 'pl12px pr12px' : null"
    >
      <div class="pitch-on">
        <div v-if="checkboxRow.length > 0">
          <span class="pitch-on-text" @click="openChecksModal">
            {{ t('sys.pageDesigner.selected') }}
            <span class="pitch-on-count">{{ checkboxRow.length }}</span>
            {{ t('sys.pageDesigner.row') }}
          </span>
          <span
            class="pitch-on-clear"
            :title="t('sys.pageDesigner.clearSelectedData')"
            @click="clearAllSelected"
          >
            <close-outlined class="iconfont" />
            <!-- <i class="iconfont icon-tianjia"></i> -->
          </span>
        </div>
        <div v-if="batchBtnGroup && !!checkboxRow.length" class="batch-btn-group">
          <RenderTableButtons
            :visible-buttons="batchBtnGroup?.visibleButtons"
            :buttons="batchBtnGroup?.children"
            :isRef="!parentWidget"
          />
        </div>
      </div>
      <div class="table-header-right">
        <div
          v-if="
            headerBtnGroupItems &&
            !(checkboxRow.length && batchBtnGroup && batchBtnGroup?.children?.length)
          "
          class="header-btn-group"
        >
          <RenderTableButtons
            :visible-buttons="headerBtnGroup?.visibleButtons"
            :buttons="headerBtnGroupItems"
            reverse
            :isRef="!parentWidget"
          />
        </div>
        <div
          class="ks-row-middle"
          v-if="
            fullScreen ||
            currentReload ||
            customHeader ||
            (productionScheduling && doNotSubmit === true)
          "
        >
          <div class="ks-col"></div>
          <a-button
            v-if="productionScheduling && doNotSubmit === true"
            @click="onProductionSchedulingSort"
          >
            <template #icon>
              <a-tooltip :title="t('sys.pageDesigner.productionScheduling')" placement="bottom">
                <i class="iconfont icon-paixu"></i> </a-tooltip
            ></template>
          </a-button>
          <a-button v-if="fullScreen && tableRef" class="ml10px">
            <template #icon> <FullScreen :el="tableRef" /></template>
          </a-button>
          <a-button v-if="currentReload" @click="getDataSource()" class="ml10px">
            <template #icon> <dataReload class="text-20px" /></template>
          </a-button>
          <fieldSortRender
            v-if="customHeader"
            :cacheKey="cacheKey"
            :headerGrouping="levelHeaderGrouping"
            :multiLevelHeader="!!multiLevelHeader"
            :columns="children"
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
        :validateByIndex="validateByIndex"
        :tableFieldId="cacheKey"
        :rowDragSort="rowDragSort"
        :loading="loading"
        :headerSort="widget.props.headerSort"
        v-model="datasource"
        :rowSelection="newRowSelection"
        :rowSelectionRadio="rowSelectionRadio"
        :operateColumn="operateColumn"
        :tableColumns="tableColumns"
        :serialNumber="serialNumber"
        @getDataSource="search"
        @radioEvent="radioEvent"
        @checkboxEvent="checkboxEvent"
        @cellClickEvent="cellClickEvent"
        @updateRowForm="updateRowForm"
        @titleSort="onTitleSort"
        :searchType="searchType"
        :seqMethod="seqMethod"
        :editMethods="editMethods"
        :exp="exp"
        ref="xtable"
        :gridType="gridType"
        :subModelField="subModelField"
        :height="tableHeight"
        :selectTheEntireRow="selectTheEntireRow"
        :levelHeaderGrouping="levelHeaderGrouping"
        :multiLevelHeader="multiLevelHeader"
        :beforeClearEdit="beforeClearEdit"
        :tableRowHeightNum="tableRowHeightNum"
        :cellHeaderHeightSync="widget.props.cellHeaderHeightSync"
      >
        <template #embed="{ row }">
          <gct-data-table
            :style="wrapperStyle"
            :parentWidget="widget"
            :key="row.id_"
            :parentData="row"
            :widget="subTableWidget"
            :sessionId="sessionId"
          />
        </template>
        <template v-for="(slot, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps"></slot>
        </template>
      </vxeRefTable>
    </a-form>
    <div class="text-right mt10px" v-if="showPagination && datasource.length">
      <a-pagination
        v-bind="paginationAttr"
        class="pagination-total-left"
        @change="showSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-data-table">
  import {
    ref,
    reactive,
    toRaw,
    onMounted,
    computed,
    toRef,
    withDefaults,
    onUnmounted,
    provide,
  } from 'vue';
  import { TableSearchTypeEnum } from '/@page-designer/enum';
  import { DataTable } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FullScreen from '/@/components/FullScreen/index.vue';
  import dataReload from '../../__components__/data_reload_button.vue';
  import {
    vxeRefTable,
    RenderTableButtons,
    fieldSortRender,
    useTableLayout,
  } from './component/vxeRenderTable';
  import { columnsType } from './type';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { cloneDeep, merge, orderBy, isEmpty } from 'lodash-es';
  import { message as Message } from 'ant-design-vue';
  import { isObject } from '/@/utils/is';
  import { DataTableChecks } from './component/data-table-checks/data-table-checks';
  import { selectionTypeEnums, TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';
  import {
    IDataTableComponentExpose,
    IDataTableQueryDataOptions,
  } from '/@/projects/page-designer/src/interface/web';
  import { useStyle } from '/@/projects/page-designer/src/hooks/useStyle';
  import { useTableEvents } from './component/transformHooks';
  import { transformButtons } from './component/transform';
  import { createUUID } from 'qx-util';
  import { createRadioSelectManager } from './use';

  const props = withDefaults(
    defineProps<{
      widget: DataTable;
      tableParamsData?: object;
      refTableId?: string;
      // 作为嵌套子表格时的父表格项数据
      parentData?: IData;
      parentWidget?: DataTable;
      sessionId: string;
    }>(),
    { sessionId: createUUID() },
  );

  const tableId = createUUID();

  const formRef = ref();
  const tableRef = ref();
  const xtable = ref();
  /**选中的单选项 */
  const radioRow = ref();
  const checkboxRow = ref<any[]>([]);
  const datasource = ref<any[]>([]);
  const { t } = useI18n();
  const cacheKey = props.widget.id;
  const formState = computed(() => {
    return { [cacheKey]: datasource.value };
  });
  const { tableHeight } = useTableLayout(xtable, props.widget, props.parentWidget);

  const tableRowHeightNum = computed(() => {
    const { cellHeightMode, cellHeight } = props.widget.props;
    if (!cellHeightMode) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW) return cellHeight || 10;
    return -1;
  });

  // 单选模式下的管理器，只有父子均开启单选模式时才生效
  const radioSelectManage = createRadioSelectManager(props.sessionId);
  // 注册当前表格的选中清空方法
  radioSelectManage.setRegisterTableClear(tableId, () => {
    radioRow.value = null;
    if (xtable.value) {
      xtable.value.getXtable().clearRadioRow();
    }
    Event.runEventByName('radioEvent', props.widget.events, null);
  });
  onUnmounted(() => {
    // 组件卸载时，删除注册
    radioSelectManage.removeRegisterTableClear(tableId);
  });

  const {
    rowDragSort,
    refSearch,
    model,
    modeldata,
    pageSize,
    showPagination,
    fullScreen,
    currentReload,
    customHeader,
    productionScheduling,
    productionSchedulingSort,
    collationField,
    collationSort,
    collation,
    datafilter,
    searchType,
    serialNumber,
    editMethods,
    exp,
    customdataSource,
    datasourceConfig,
    subModelField,
    gridType,
    rowSelectionType,
    rowSelection,
    selectTheEntireRow,
    multiLevelHeader,
    cellHeightMode,
    cellHeight,
  } = toRaw(props.widget.props);
  provide('tableCellHeight', { cellHeightMode, cellHeight });

  const levelHeaderGrouping = ref(props.widget.props.levelHeaderGrouping);
  /**多选标识 兼容老数据 */
  const newRowSelection = rowSelectionType === selectionTypeEnums.MultipleChoice || rowSelection;
  const rowSelectionRadio = rowSelectionType === selectionTypeEnums.SingleChoice;

  /**嵌套子表向主表获取状态 */
  const doNotSubmit = props.parentWidget?.props?.doNotSubmit || props.widget.props.doNotSubmit;
  const initializeLoad = ref(props.widget.props.initializeLoad);
  const children = props.widget.children![1].children;
  const operateColumn = toRef(() => {
    if (props.widget.children![0]?.children?.length) {
      return props.widget.children![0];
    }
  });
  if (operateColumn.value?.id) {
    transformButtons(operateColumn.value?.children);
    operateColumn.value.id = undefined;
  }
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
  const subTableWidget = toRef(() => {
    const data = props.widget.children![4];
    if (data && !isEmpty(data)) {
      return { ...data };
    }
  });
  const { wrapperStyle } = useStyle(subTableWidget.value!);
  /**字段排序 */
  const fieldSort = ref({ sortField: '', sortType: '' });
  /**接口排序 */
  const querySort = getQuerySort({ collationField, collationSort, collation });
  const refSorts = computed(() => {
    if (fieldSort.value.sortType) {
      return [fieldSort.value];
    }
    return querySort ?? [];
  });
  /**数据筛选 */
  const queryfilter = useQueryfilter(datafilter);
  const cacheColumns = ref<columnsType>();
  const tableColumns = toRef(() => {
    if (customHeader && cacheColumns.value) {
      return cacheColumns.value;
    } else {
      return children;
    }
  });
  const pageSizeOptions = reactive([10, 20, 30, 40, 50]);

  const Event = getPageEvent();
  const total = ref(0);
  const loading = ref(false);
  const addSize = pageSizeOptions.find((i) => pageSize == i);
  if (!addSize) {
    pageSizeOptions.push(pageSize);
    pageSizeOptions.sort((a, b) => a - b);
  }
  const foreignFields = children
    .filter((i) => i.props.isFieldModel)
    .map((i) => i.props.bindFieldLink?.join('.'));
  const pagination = reactive<Required<IDataTableQueryDataOptions>>({
    pageSize: pageSize,
    pageNo: 1,
    query: {},
    exp: '',
    foreignFields: [],
    sorts: [],
  });

  /**嵌套表格查询专用 */
  const { parentField, searchField } = (() => {
    if (props.parentData && subModelField) {
      const [parent_Field, search_Field] = subModelField?.split(':');
      pagination.query[`${search_Field}.eq`] = props.parentData.id_;
      return { parentField: parent_Field, searchField: search_Field };
    } else {
      return {};
    }
  })();
  const lastQueryData = ref<IDataTableQueryDataOptions>({} as any);
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

  // 生产试算排序
  const onProductionSchedulingSort = () => {
    if (productionSchedulingSort) {
      const sortFields = productionSchedulingSort as {
        collationField: string;
        collationSort: string;
      }[];
      datasource.value = orderBy(
        datasource.value,
        sortFields.map((item) => item.collationField) as string[],
        sortFields.map((item) => item.collationSort) as any[],
      );
    }
  };

  onMounted(async () => {
    /**
     * 初始化不加载
     */
    await getBodyBySearchComponent(refSearch);
    if ((initializeLoad.value || props.parentData) && searchType !== TableSearchTypeEnum.EMBEDDED) {
      await getDataSource();
    }
  });

  /**分页 */
  function showSizeChange(current, pageSize) {
    getDataSource({ pageNo: current, pageSize });
  }

  async function updateCacheColumn(options) {
    // console.log('updateCacheColumn', options);
    cacheColumns.value = options;
  }

  async function updateGroup(options) {
    // console.log('updateGroup', options);
    levelHeaderGrouping.value = options;
  }

  async function beforeClearEdit() {
    try {
      await formRef.value.validate();
      return true; // 校验通过,允许关闭编辑
    } catch (error) {
      return false; // 校验失败,禁止关闭编辑
    }
  }

  // /**同步字段 */
  // function changeColums(list: string[]) {
  //   cacheColumns.value = [];
  //   list.forEach((id) => {
  //     const w = children.find((i) => i.id === id);
  //     w && cacheColumns.value.push(w);
  //   });
  // }

  /**
   * 支持自定义数据源
   * @param queryData
   */
  async function getDataSourceByType(queryData: IDataTableQueryDataOptions) {
    if (customdataSource && datasourceConfig?.name) {
      const dataExtraParams = datasourceConfig?.extraParams;
      const extraParams = props.parentData
        ? {
            dataExtraParams,
            parentData: props.parentData,
          }
        : dataExtraParams;
      return Event.runExportByName(datasourceConfig?.name, queryData, formState.value, extraParams);
    } else {
      const data = await Event.context.$httpBizService(
        {
          action: showPagination ? 'listByPage' : 'listAll',
          key: model,
          modelCategory: modeldata?.modelCategory,
        },
        queryData,
      );
      if (!data?.data?.length && data?.totalCount > 0 && queryData.pageNo && queryData.pageNo > 1) {
        queryData.pageNo -= 1;
        return getDataSourceByType(queryData);
      }

      return data;
    }
  }
  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(queryData?: IDataTableQueryDataOptions) {
    if (!!props.tableParamsData && !props.refTableId) {
      setDataSource([]);
      return;
    }
    let { pageNo, pageSize, query, exp, sorts = [] } = Object.assign({}, pagination, queryData);
    lastQueryData.value = {
      query: { ...query, ...(props.tableParamsData || {}), ...queryfilter.query },
      exp: queryfilter.getExp(exp),
      pageNo,
      pageSize,
      foreignFields,
      sorts: [...refSorts.value, ...sorts],
    };
    console.log('data-table-render:getDataSource', lastQueryData.value);
    loading.value = true;
    try {
      let data = (await getDataSourceByType(lastQueryData.value)) as any;
      pagination.pageNo = data.pageNo;
      pagination.pageSize = data.pageSize;
      pagination.exp = lastQueryData.value?.exp || '';
      pagination.query = lastQueryData.value?.query || {};
      total.value = data.totalCount;
      datasource.value = transformSourceData(data.data, data.dict);
      radioRow.value = '';
      setCurrentPageSelected();
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }

  function setCurrentPageSelected() {
    // 设置当前页已经选中的数据
    const keys = datasource.value
      .filter((row) => {
        const i = checkboxRow.value.findIndex((item) => item.id_ === row.id_);
        return i !== -1;
      })
      .map((row) => row.id_);
    if (xtable.value) {
      xtable.value.setSeleckedByKeys('id_', keys);
    }
  }

  function onTitleSort(data: any) {
    fieldSort.value = data;
    search();
  }

  async function search(queryData?: IDataTableQueryDataOptions) {
    /**查询 */
    await getDataSource(queryData);
    clearAllSelected();
  }

  async function getBodyBySearchComponent(key: string) {
    if (!key || searchType !== TableSearchTypeEnum.EXTERNAL) return {};
    /**注册事件到查询组件 */
    Event.initSearchs(key, search, props.widget.id);
    try {
      /**重查询组件内获取查询条件 */
      let searchVm = (await Event.getSyncComponent(key)) as any;
      let queryData = (await searchVm.getBodyBySearch()) || {};
      merge(pagination, queryData);
    } catch (error) {}
  }

  function radioEvent(value) {
    radioRow.value = value;
    radioSelectManage.clearRadioSelect(tableId);
    Event.runEventByName('radioEvent', props.widget.events, cloneDeep(value));
  }

  function checkboxEvent(rows: any[]) {
    // 未选中的数据
    const notRows = datasource.value.filter((row) => {
      const i = rows.findIndex((item) => item.id_ === row.id_);
      return i === -1;
    });
    // 从已选中中，把当前页未选中的数据排除掉
    checkboxRow.value = checkboxRow.value.filter((row) => {
      const i = notRows.findIndex((item) => item.id_ === row.id_);
      return i === -1;
    });
    // 设置入新选中的数据
    rows.forEach((row) => {
      const i = checkboxRow.value.findIndex((item) => item.id_ === row.id_);
      if (i === -1) {
        checkboxRow.value.push(row);
      }
    });
    Event.runEventByName('checkboxEvent', props.widget.events, cloneDeep(checkboxRow.value));
  }

  function cellClickEvent(_row) {
    Event.runEventByName('cellClickEvent', props.widget.events, cloneDeep(_row));
  }

  function clearAllSelected(): void {
    checkboxRow.value = [];
    xtable.value.setSeleckedByKeys('id_', []);
    Event.runEventByName('checkboxEvent', props.widget.events, []);
  }

  function openChecksModal(): void {
    let column = (tableColumns.value as any[]).find((row) => {
      if (row.isField === true && row.props.fixedAlign === 'left') {
        return row;
      }
    });
    if (!column) {
      column = tableColumns.value[0];
    }
    gct.openUtil
      .modal(
        DataTableChecks,
        { items: checkboxRow.value, widget: column },
        { footer: false, width: 640, height: 540 },
      )
      .then((_) => {
        if (_.ok) {
          checkboxRow.value = _.data!;
          setCurrentPageSelected();
        }
      });
  }

  /**设置查询条件 */
  function setParamsData(query?: object, paginationData: IDataTableQueryDataOptions = {}) {
    if (typeof query !== 'object') return;
    for (let k in query) {
      pagination.query[k] = query[k];
    }
    for (let i in paginationData) {
      pagination[i] = paginationData[i];
    }
  }

  /**序号计算逻辑 */
  function seqMethod({ rowIndex }) {
    if (!showPagination) return rowIndex + 1;
    const start = rowIndex + 1;
    return (pagination.pageNo - 1) * pagination.pageSize + start;
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
  /**
   * 关闭编辑状态时候保存数据
   * @param formData
   */
  async function updateRowForm({ row, rowIndex }) {
    await validateByIndex(rowIndex);
    if (doNotSubmit) return;
    await Event.context.$httpBizService(
      {
        key: model,
        action: 'saveOrUpdate',
        modelCategory: modeldata?.modelCategory,
      },
      { ...row, _DICT: undefined, _OPCT: undefined },
    );
  }

  /**根据数据id删除数据 */
  async function deleteDataByids(ids: string[] = []) {
    if (props.parentData && searchField === 'ref_master_id_') {
      //删除子表逻辑
      datasource.value.forEach((i) => {
        if (ids.includes(i.id_)) {
          i.deleted_ = true;
        }
      });
      await updateChildren();
    } else {
      //删除普通表格逻辑
      await Event.context.$httpBizService(
        { key: model, action: 'removeByIds', modelCategory: modeldata?.modelCategory },
        { ids: ids.join(',') },
      );
      if (subTableWidget.value) {
        /**删除关联数据表 */
        await deleteRefData(ids);
      }
    }
  }

  /**删除关联数据表的数据 */
  async function deleteRefData(ids: string[] = []) {
    const [parent_Field, search_Field] = subModelField?.split(':') || [];
    if (search_Field === 'ref_master_id_' || !search_Field) return;
    /**嵌套关联数据表 */
    const _P = ids.map((id) =>
      Event.context.$httpBizService(
        {
          action: 'remove',
          key: parent_Field,
          modelCategory: modeldata?.modelCategory,
        },
        {
          query: {
            [`${search_Field}.eq`]: id,
          },
        },
      ),
    );
    await Promise.all(_P);
  }

  /**嵌套子表更新子表数据逻辑 */
  async function updateChildren(upData?: any[]) {
    const { id_, data_version_ } = props.parentData || {};
    const key = props.parentWidget?.props.model!;
    const modelCategory = props.parentWidget?.props?.modeldata?.modelCategory;
    const dataId = await Event.context.$httpBizService(
      {
        key,
        action: 'submit',
        modelCategory,
      },
      { [parentField]: upData || datasource.value, id_, data_version_ },
    );
    /**子表删除更新版本标识 */
    const data = await Event.context.$httpBizService(
      {
        key,
        action: 'getById',
        modelCategory,
      },
      { id: dataId },
    );
    props.parentData.data_version_ = data?.data?.data_version_;
  }

  /**
   * 批量选中行根据Ids
   */
  async function deleteByChecked() {
    const ids = checkboxRow.value.map((i) => i.id_);
    await deleteDataByids(ids);
    Message.success(t('sys.delSuccess'));
    getDataSource();
    checkboxRow.value = [];
  }

  function getParameters() {
    return cloneDeep(lastQueryData.value);
  }
  useTableEvents({
    getDataSource,
    datasource,
    Event,
    deleteByChecked,
    doNotSubmit,
    deleteDataByids,
    updateChildren,
    getParameters,
    checkboxRow,
    searchField,
    parentField,
    parentData: props.parentData,
    modeldata,
    model,
    subTableWidget: props.widget,
  });

  function setDataSource(data = [], dict?: object) {
    const options = transformSourceData(data, dict);
    datasource.value = options;
    radioRow.value = '';
    checkboxRow.value = [];
    if (showPagination) {
      pagination.pageNo = 1;
      pagination.pageSize = pageSize;
      total.value = options.length;
    }
  }

  defineExpose<IDataTableComponentExpose>({
    reload: getDataSource,
    /**实时获取当前页面的选中项 */
    getCurrentSelectedValue() {
      const t = xtable.value.getXtable();
      if (newRowSelection) {
        return t.getCheckboxRecords();
      } else {
        return t.getRadioRecord();
      }
    },
    getSelectedValue() {
      if (newRowSelection) {
        return cloneDeep(checkboxRow.value);
      } else {
        return radioRow.value;
      }
    },
    async setSeleckedByKeys(rowKey: string, keys: string[]) {
      xtable.value.setSeleckedByKeys(rowKey, keys);
      if (!keys?.length) {
        checkboxRow.value = [];
        return;
      }
      const notIncludesIds = keys.filter((e) => !datasource.value.some((f) => e === f[rowKey]));
      if (notIncludesIds.length <= 0) {
        checkboxRow.value = datasource.value.filter((e) => keys.includes(e[rowKey]));
        return;
      }
      /**存在分页问题，所以设置选中项不能依赖于本地数据源，只能独立走查询 */
      const data = await Event.context.$httpBizService(
        {
          action: 'listAll',
          key: model,
          modelCategory: modeldata?.modelCategory,
        },
        {
          query: {
            [`${rowKey}.in`]: keys,
          },
        },
      );
      checkboxRow.value = transformSourceData(data.data, data.dict);
    },
    addDataSource(data, dict) {
      isObject(data) && (data = [data]);
      const options = transformSourceData(data, dict);
      datasource.value.push(...options);
      initializeLoad.value = false;
    },
    setDataSource,
    getDataSource() {
      const tData = cloneDeep(datasource.value);
      return tData;
    },
    async fullValidate() {
      await formRef.value.validate();
    },
    validateByIndex,
    setParamsData,
    getParameters,
    deleteByChecked,
  });
</script>
<style scoped lang="scss">
  .data-table-render.embed.is-enable-select {
    .data-table-render.sub {
      .table-header-container {
        margin-left: 48px;
        border-left: 1px solid #e8ebf0;
      }
    }

    .vxe-grid.vxetable.sub {
      margin-left: 48px;
    }
  }

  .data-table-render.sub {
    background-color: #f9fafb;

    .table-header-container {
      margin-left: 16px;
      border-left: 1px solid #e8ebf0;
    }
  }

  .table-header-container {
    display: flex;
    justify-content: space-between;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .batch-btn-group {
    display: inline-flex;
    margin-left: 16px;
    gap: 8px;
  }

  .table-header-right {
    display: inline-flex;
    align-items: center;
    float: right;
  }

  .header-btn-group {
    display: inline-flex;
    height: 100%;
    gap: 8px;
  }

  .pitch-on {
    display: inline-flex;
    align-items: center;
    height: 100%;
    float: left;
    font-size: 14px;
    cursor: pointer;
  }

  .ks-row-middle {
    display: inline-flex;
  }

  .pitch-on-text {
    &:hover {
      color: var(--ant-primary-color);
    }

    .pitch-on-count {
      color: var(--ant-primary-color);
    }
  }

  .pitch-on-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: 4px;
    border-radius: 50%;
    background-color: rgb(0 0 0 / 25%);
    vertical-align: middle;

    &:hover {
      background-color: rgb(0 0 0 / 45%);
    }

    .iconfont {
      color: #fff;
      font-size: 12px;
    }
  }
</style>
