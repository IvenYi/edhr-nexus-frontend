<template>
  <div class="box-border context">
    <div class="title-wrap">
      <a-input-search
        v-model:value="keyword"
        :placeholder="searchPlaceholder"
        enter-button
        v-show="showSearch"
        @search="showSizeChange(1)"
        style="margin-bottom: 10px"
      />
      <div class="ks-row-middle">
        <span class="mrauto">{{ title }}</span>
        <span v-if="showPagination" class="page-total">{{ datasource.length }} / {{ total }}</span>
        <span v-else class="page-total">{{ datasource.length }}</span>
        <sort class="sort-span" @sort="getDataSource" v-model="sortType" />
      </div>
    </div>

    <div class="list ks-col" v-loading="loading">
      <div v-show="!datasource.length" class="pt100px"> <a-empty /> </div>
      <a-tree
        block-node
        :load-data="onLoadData"
        :tree-data="datasource"
        :virtual="false"
        @select="clickCell"
        v-if="!loading"
        v-model:selectedKeys="selectedKeys"
        :style="{ '--text-rows': maxRows || 1 }"
      >
        <template #title="{ name_, base_id_, version_, default_ }">
          <template v-if="base_id_">
            <div class="ks-row-middle">
              <div class="mr10px ks-col list-cell-text-overflow" :title="version_">
                {{ version_ }}
              </div>
              <a-tag :color="getThemeColor" v-if="!!default_">
                {{ $t('sys.pageDesigner.default') }}
              </a-tag>
            </div>
          </template>
          <!-- <a-tooltip v-else :title="name_">
          </a-tooltip> -->
          <div v-else class="list-cell-text-overflow" :title="name_">
            {{ name_ }}
          </div>
        </template>
      </a-tree>
    </div>
    <div class="text-center whitespace-nowrap" v-if="showPagination">
      <!-- <a-pagination
        simple
        :current="pageNo"
        :total="total"
        :defaultPageSize="pageSize"
        @change="showSizeChange"
      /> -->
      <pagerSelect
        v-model:current="pageNo"
        :total="total"
        :page-size="pageSize"
        @page-change="showSizeChange"
      />
    </div>
  </div>
</template>

<script name="gct-data-list" setup lang="ts">
  import sort from '../../__components__/sort.vue';
  import { DataList } from '/@page-designer/types/web';
  import { toRef, reactive, ref, onMounted, toRaw, nextTick } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import type { TreeProps } from 'ant-design-vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import pagerSelect from '../../__components__/pager-select.vue';
  import { useQueryfilter } from '/@page-designer/components/widgets/hooks/listhook';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { IRdoDataListComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const { getThemeColor } = useRootSetting();
  const selectedKeys = ref<string[]>([]);
  const keyword = ref('');
  const datasource: any = ref([]);
  const loading = ref(false);
  const pageNo = ref(1);
  const total = ref(0);
  const props = defineProps<{ widget: DataList }>();
  const totalPage = ref(1);
  const {
    showSearch,
    searchPlaceholder,
    title,
    model,
    modeldata,
    pageSize,
    collationField,
    collationSort,
    collation,
    datafilter,
    showPagination,
    maxRows,
  } = reactive(props.widget.props);
  const sortType = ref(collationSort);
  const Event = getPageEvent();
  onMounted(() => {
    getDataSource();
  });
  const querySort = toRef(() => {
    if (!sortType.value) return [];
    if (collation) {
      return collation
        .filter((i) => i.collationField)
        .map((i, index) => {
          return {
            sortField: i.collationField,
            sortType: index > 0 ? i.collationSort : sortType.value,
          };
        });
    } else {
      return collationSort ? [{ sortField: collationField, sortType: sortType.value }] : [];
    }
  });
  const queryfilter = useQueryfilter(datafilter);
  async function getDataSource() {
    loading.value = true;
    try {
      let data = await Event.context.$httpBizService(
        {
          action: showPagination ? 'rdoListByPage' : 'rdoListAll',
          key: model,
          modelCategory: modeldata?.modelCategory,
        },
        {
          keyword: keyword.value,
          pageNo: pageNo.value,
          pageSize,
          sorts: querySort.value,
        },
      );

      total.value = data?.totalCount;
      datasource.value =
        data?.data?.map((i) => {
          return { ...i, isLeaf: false, key: i.id_ };
        }) || [];
      totalPage.value = data.totalPage;
    } catch (error) {
      console.log(error);
    }
    await nextTick();
    loading.value = false;
  } /**分页 */
  function showSizeChange(current) {
    pageNo.value = current;
    getDataSource();
  }

  async function clickCell(row, treeNode) {
    if (!row.length) return;
    const nodeRow = toRaw({ ...treeNode.selectedNodes[0] });
    if (!nodeRow.children && !nodeRow.base_id_) {
      nodeRow.children = await getChildrens(nodeRow.id_);
    }
    if (!nodeRow.base_id_) {
      nodeRow._default = nodeRow.children.find((i) => !!i.default_);
    }
    Event.runEventByName('cellClickEvent', props.widget.events, nodeRow);
  }

  const onLoadData: TreeProps['loadData'] = async (treeNode) => {
    const data = await getChildrens(treeNode.id_);
    treeNode.dataRef!.children = data;
    datasource.value = [...datasource.value];
  };
  async function getChildrens(id) {
    const data = await Event.context.$httpBizService(
      { action: 'rdoListAllVersion', key: model, modelCategory: modeldata?.modelCategory },
      {
        query: {
          base_id_: id,
          ...queryfilter.query,
        },
      },
    );
    return transformSourceData(data.data, data.dict).map((i) => {
      return { ...i, isLeaf: true, key: i.id_ };
    });
  }
  defineExpose<IRdoDataListComponentExpose>({
    setValue(id) {
      selectedKeys.value = id ? [id] : [];
    },
    getValue() {
      let id = selectedKeys.value[0];
      if (!id) return;
      var data;
      datasource.value.forEach((i) => {
        if (i.id_ === id) {
          data = i;
        }
        i.children?.forEach((j) => {
          if (j.id_ === id) {
            data = j;
          }
        });
      });
      return data;
    },
    reload() {
      getDataSource();
    },
  });
</script>

<style lang="less" scoped>
  .mrauto {
    font-weight: 600;
  }

  .list {
    overflow-y: auto;
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
  }

  .context {
    display: flex;
    flex-direction: column;
    height: 100%;
    // min-height: 164px;
  }

  :deep(.ant-tree-treenode-selected) {
    background: #f5f5f5;
    color: var(--ant-primary-color);
  }

  :deep(.ant-tree) {
    background-color: transparent;

    .ant-tree-treenode {
      padding: 4px;
    }

    .ant-tree-title {
      display: -webkit-inline-box;
      display: -moz-inline-box;
      display: inline-flexbox;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      -webkit-line-clamp: var(--text-rows, 1);
      line-clamp: var(--text-rows, 1);
      -webkit-box-orient: vertical;
      -moz-box-orient: vertical;
      box-orient: var(--text-rows, 1);
    }
  }

  :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
    background: transparent;
    color: var(--ant-primary-color);
  }

  :deep(.ant-tree-node-content-wrapper) {
    &:hover {
      background-color: transparent;
      // color: var(--ant-primary-color);
    }
  }

  .page-total {
    padding: 2px 4px;
    border-radius: 2px;
    background: #f5f5f5;
    font-size: 12px;
  }

  .sort-span {
    margin-left: 7px;
  }

  .title-wrap {
    padding: 10px 15px;
  }

  :deep(.ant-tree-treenode) {
    padding: 9px 15px;
  }

  :deep(.ant-tree-switcher) {
    width: auto;
  }

  :deep(.ant-tree-switcher .ant-tree-switcher-icon) {
    color: #888c9f;
  }

  :deep(.ant-tree-treenode:hover) {
    background-color: #f5f5f5;
  }

  .list-cell-text-overflow {
    display: -webkit-inline-box;
    display: -moz-inline-box;
    display: inline-flexbox;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: normal;
    -webkit-line-clamp: var(--text-rows, 1);
    line-clamp: var(--text-rows, 1);
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    box-orient: var(--text-rows, 1);
  }
</style>
