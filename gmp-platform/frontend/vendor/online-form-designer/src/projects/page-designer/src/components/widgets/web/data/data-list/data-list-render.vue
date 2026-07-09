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
        <span v-if="showPagination && modelType !== EntityModelTypeEnum.TREE" class="page-total"
          >{{ datasource.length }} / {{ total }}</span
        >
        <span v-else-if="modelType !== EntityModelTypeEnum.TREE" class="page-total">{{
          datasource.length
        }}</span>
        <sort class="sort-span" @sort="getDataSource()" v-model="sortType" />
      </div>
    </div>

    <div class="list ks-col" v-loading="loading">
      <div v-show="!datasource.length" class="pt100px"> <a-empty /> </div>

      <a-tree
        :fieldNames="{ title: '_LABEL_', key: 'id_' }"
        v-if="modelType === EntityModelTypeEnum.TREE"
        block-node
        :load-data="onLoadData"
        :tree-data="datasource"
        :virtual="false"
        v-model:expandedKeys="expandedKeys"
        @select="clickCell"
        :style="{ '--text-rows': maxRows || 1 }"
      >
        <template #title="item">
          <!-- <a-tooltip :title="_LABEL_">
            {{ _LABEL_ }}
          </a-tooltip> -->
          <CellItem
            class="list-cell-text-overflow"
            :row="item"
            :showField="showField"
            :showFieldExp="showFieldExp"
            :showFieldExpVal="showFieldExpVal"
          />
        </template>
      </a-tree>
      <template v-else>
        <div
          v-for="item in datasource"
          class="list-cell"
          :class="{ active: item.id_ && item.id_ === activeNode?.id_ }"
          :key="item.id_"
          :style="{ '--text-rows': maxRows || 1 }"
          @click="clickCell(item)"
        >
          <CellItem
            class="list-cell-text-overflow"
            :row="item"
            :showField="showField"
            :showFieldExp="showFieldExp"
            :showFieldExpVal="showFieldExpVal"
          />
        </div>
      </template>
    </div>
    <div class="text-center" v-if="showPagination && modelType !== EntityModelTypeEnum.TREE">
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
  import { reactive, ref, onMounted, toRaw, toRef } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import pagerSelect from '../../__components__/pager-select.vue';
  import { useQueryfilter } from '/@page-designer/components/widgets/hooks/listhook';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { ListTreeSearchTypeEnum } from '/@page-designer/enum';
  import type { TreeProps } from 'ant-design-vue';
  import CellItem from './cell-item.vue';
  import { IDataListComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const expandedKeys = ref([]);
  const activeNode: any = ref();
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
    searchField,
    collationField,
    showField,
    collationSort,
    collation,
    datafilter,
    showPagination,
    defaultExpandLevel,
    maxRows,
    showFieldExp,
    showFieldExpVal,
  } = reactive(props.widget.props);
  //兼容老数据
  const modelType = modeldata?.modelType || props.widget.props.modelType;
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
  const exp = searchField?.length ? `OR(${searchField.map((i) => `${i}.like`)})` : undefined;
  const fieldLikeData = toRef(() => {
    return keyword.value
      ? searchField?.reduce((total, curr) => {
          const key = `${curr}.like`;
          total[key] = keyword.value;
          return total;
        }, {}) || {}
      : {};
  });
  const queryfilter = useQueryfilter(datafilter);
  async function getDataSource() {
    loading.value = true;
    try {
      if (modelType === EntityModelTypeEnum.TREE) {
        await getTreeList();
      } else {
        await getDataList();
      }
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }

  /**
   * tree 模型查询
   */
  async function getTreeList(
    searchType: ListTreeSearchTypeEnum = ListTreeSearchTypeEnum.LEVEL,
    parent_id_?: string,
  ) {
    const treeParmse = {};
    if (Object.keys(fieldLikeData.value)?.length || Object.keys(queryfilter.query)?.length) {
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
        query: { ...fieldLikeData.value, ...queryfilter.query, ...treeParmse },
        exp: queryfilter.getExp(exp),
        sorts: querySort.value,
      },
    )) as any;

    const trees = transformTree(transformSourceData(data.data, data.dict), searchType);
    if (searchType !== ListTreeSearchTypeEnum.CHILDREN) {
      datasource.value = trees;
    }
    return trees;
  }
  function transformTree(list, searchType: ListTreeSearchTypeEnum) {
    const map = {},
      roots: any[] = [];
    for (let i = 0; i < list.length; i++) {
      map[list[i].id_] = i;
      list[i].children = [];
    }
    for (let i = 0; i < list.length; i++) {
      const node = list[i];
      node._LABEL_ = node._DICT[showField] || node[showField];
      const isroot = list.every((i) => i.id_ !== node.parent_id_);
      if (node.parent_id_ === null || isroot) {
        roots.push(node);
      } else {
        const children = list[map[node.parent_id_]]?.children;
        children && children.push(node);
      }
    }
    list.forEach((i) => {
      if (
        searchType === ListTreeSearchTypeEnum.ALL ||
        searchType === ListTreeSearchTypeEnum.SEARCH
      ) {
        i.isLeaf = !i.children.length;
      } else {
        i.isLeaf = !i.__NON_LEAF__;
      }
      if (i.children.length) {
        expandedKeys.value.push(i.id_);
      }
    });

    return roots;
  }
  /**
   * 普通查询
   */
  async function getDataList() {
    let data = await Event.context.$httpBizService(
      {
        action: showPagination ? 'listByPage' : 'listAll',
        key: model,
        modelCategory: modeldata?.modelCategory,
      },
      {
        query: { ...fieldLikeData.value, ...queryfilter.query },
        pageNo: pageNo.value,
        pageSize,
        exp: queryfilter.getExp(exp),
        sorts: querySort.value,
      },
    );

    total.value = data.totalCount;
    datasource.value = transformSourceData(data.data, data.dict).map((i) => {
      const _LABEL_ = i?._DICT?.[showField] || i[showField];
      return { ...i, _LABEL_ };
    });
    totalPage.value = data.totalPage;
  }

  /**分页 */
  function showSizeChange(current) {
    pageNo.value = current;
    expandedKeys.value = [];
    getDataSource();
  }

  function clickCell(row, { node } = {}) {
    if (!props.widget.events['cellClickEvent']) return;
    if (modelType === EntityModelTypeEnum.TREE) {
      row = node;
    }
    Event.runEventByName('cellClickEvent', props.widget.events, toRaw(row));
    activeNode.value = row;
  }

  const onLoadData: TreeProps['loadData'] = async (treeNode) => {
    const children = await getTreeList(ListTreeSearchTypeEnum.CHILDREN, treeNode.id_);
    treeNode.dataRef!.children = children;
    datasource.value = [...datasource.value];
  };
  defineExpose<IDataListComponentExpose>({
    setValue(id_) {
      activeNode.value = id_ ? { id_ } : '';
    },
    getValue() {
      return toRaw(activeNode.value);
    },
    reload(id_) {
      if (id_) {
        activeNode.value = id_ ? { id_ } : '';
      }
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

  .active {
    border-left: 2px solid var(--ant-primary-color);
    background-color: rgb(13 170 156 / 6%);
    color: var(--ant-primary-color);
  }

  .title-wrap {
    padding: 10px 15px;
  }

  .list-cell {
    height: auto;
    padding: 9px 15px;

    &:hover {
      background-color: #f5f5f5;
      cursor: pointer;
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

  :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
    background: transparent;
    color: var(--ant-primary-color);
  }

  :deep(.ant-tree-node-content-wrapper) {
    &:hover {
      background-color: transparent;
      // color: var(--ant-primary-color);
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

  :deep(.ant-tree-treenode-selected) {
    background: #f5f5f5;
    color: var(--ant-primary-color);
  }

  :deep(.ant-tree) {
    background-color: transparent;

    .ant-tree-treenode {
      padding: 4px;
    }
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
