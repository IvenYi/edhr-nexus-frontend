<template>
  <div ref="tableRef" class="bg-[#fff]">
    <div class="table-header-container">
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
        <a-button v-if="customHeader" class="ml10px">
          <template #icon>
            <fieldFilter
              class="text-20px"
              :columns="columnChildren"
              :cacheKey="cacheKey"
              @changeColumsByIds="changeColums"
          /></template>
        </a-button>
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
      >
        <template #field="{ widget, row, rowIndex }">
          <table-cell
            v-if="!!row.version_ || widget.type === 'rdo-input'"
            class="ell w100%"
            :widget="widget"
            :rowValue="row"
            :index="rowIndex"
            :rowReadonly="true"
            style="padding: 13px 0"
          />
          <span v-else></span>
        </template>
        <template #operate="{ row, rowIndex }">
          <opeButtons
            v-if="!row.base_id_"
            :row="row"
            :operateColumn="parentdata"
            :index="rowIndex"
            @deleteById="(id) => deleteById(id, 'rdoRemoveById')"
          />
          <opeButtons
            v-else
            :row="row"
            :operateColumn="childrendata"
            :index="rowIndex"
            @deleteById="(id) => deleteById(id, 'rdoRemoveVersionById')"
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
    opeButtons,
    vxeRefTable,
    dataReload,
    fieldFilter,
    tableCell,
    useTableLayout,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { cloneDeep, merge } from 'lodash-es';
  import { message as Message, Modal } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isObject } from '/@/utils/is';
  import { RenderTableButtons } from '/@page-designer/components/widgets/web/data/data-table/component/render-table-buttons/render-table-buttons';
  import { ITxnDataCollection } from './schema';
  import {
    IRdoTableComponentExpose,
    IDataTableQueryDataOptions as QueryDataOptions,
  } from '/@/projects/page-designer/src/interface';
  import { useTableEvents } from './transformHooks';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import {
    getMedProModelMetaHasDataAssociation,
    getMedProModelMetaGetSysConfig,
  } from '/@/apis/gct-apaas/MedProCommonController';

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
  } = <Required<ITxnDataCollection['props']>>props.widget.props;
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
    return props.widget.children[0];
  });
  const parentdata = operateColumn.value.children[0];
  const childrendata = operateColumn.value.children[1];
  parentdata.children.forEach((i) => {
    i.props.modeldata = modeldata;
  });
  childrendata.children.forEach((i) => {
    i.props.modeldata = modeldata;
  });
  const treeConfig = {
    transform: true,
    rowField: 'id_',
    parentField: 'base_id_',
    expandAll: true,
  };
  /**数据筛选 */
  const queryfilter = useQueryfilter(datafilter);
  const cacheColumns = ref([]);
  const tableColumns = computed(() => {
    if (customHeader) {
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

  /**同步字段 */
  function changeColums(list: string[]) {
    cacheColumns.value = [];
    list.forEach((id) => {
      const w = columnChildren.find((i) => i.id === id);
      w && cacheColumns.value.push(w);
    });
  }

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
    treeTable.setAllTreeExpand(true);
  } /**分页 */

  function onTitleSort(data: any) {
    if (data.sortField === 'table_name_') {
      data.sortField = 'name_';
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

  /**
   * 删除选中行根据Id
   */
  async function deleteById(id: string, action: string) {
    // 临时方案，待优化。删除时，如果存在关联数据，则提示用户
    const appInfoStore = useAppInfoStore();

    if (appInfoStore.appInfo.suiteKey === 'MEDPRO') {
      const NOT_DELETE_ENABLED_KEY = 'not.delete.enabled';
      const REMOVE_TWICE_ALERT_ENABLED_KEY = 'remove.twice.alert.enabled';

      const notDelete = await getMedProModelMetaGetSysConfig({ key: NOT_DELETE_ENABLED_KEY });

      const confirmDelete = await getMedProModelMetaGetSysConfig({
        key: REMOVE_TWICE_ALERT_ENABLED_KEY,
      });

      if (notDelete || confirmDelete) {
        const dataAssociationRes = await getMedProModelMetaHasDataAssociation({
          modelKey: model,
          id: id,
        });
        if (dataAssociationRes) {
          if (notDelete) {
            Message.error('该数据已被引用，无法删除');
          } else if (confirmDelete) {
            Modal.confirm({
              content: t('该数据已被引用，是否确认删除？'),
              async onOk() {
                try {
                  await executeDeleteAction(id, action);
                } catch (error) {}
              },
              onCancel() {},
            });
          }
          return;
        }
      }
    }
    // 执行实际的删除操作
    await executeDeleteAction(id, action);
  }

  /**
   * 执行实际的删除操作
   */
  async function executeDeleteAction(id: string, action: string) {
    await Event.context.$httpBizService(
      {
        key: model!,
        action,
        modelCategory: modeldata?.modelCategory,
      },
      { id },
    );
    Message.success(t('sys.delSuccess'));
    getDataSource();
  }
  function getParameters() {
    return cloneDeep(lastQueryData.value);
  }
  useTableEvents({
    getDataSource,
    getParameters,
  });
  defineExpose<IRdoTableComponentExpose>({
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
</style>
