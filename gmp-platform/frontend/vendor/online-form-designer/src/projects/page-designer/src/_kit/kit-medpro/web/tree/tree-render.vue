<template>
  <a-spin :spinning="spinning">
    <div class="tree-wrapper">
      <a-tree
        v-if="treeData?.length"
        v-model:selectedKeys="selectedKeys"
        v-model:expandedKeys="expandedKeys"
        :tree-data="treeData"
        :show-icon="showIcon"
        :show-line="showLine"
        :defaultExpandAll="defaultExpandAll"
        @select="afterSelect"
      >
        <template v-if="showIcon" #icon>
          <file-outlined />
        </template>
      </a-tree>
      <a-empty :image="simpleImage" v-else />
    </div>
  </a-spin>
</template>

<script setup lang="ts" name="gct-tree-render">
  import { ref, toRefs, onMounted, nextTick, reactive } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { ListTreeSearchTypeEnum } from '/@page-designer/enum';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { IDataTableQueryDataOptions as QueryDataOptions } from '/@/projects/page-designer/src/interface/web';
  import { cloneDeep, merge } from 'lodash-es';
  import { Empty } from 'ant-design-vue';

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const props = defineProps(widgetProps);
  const Event = getPageEvent();

  const { model, showIcon, showLine, initializeLoad, defaultExpandLevel, modeldata, refSearch } =
    toRefs(props.widget.props);

  const selectedKeys = ref<string[]>([]);
  const expandedKeys = ref<string[] | undefined>([]);
  const loading = ref(false);
  const lastQueryData = ref({});
  const defaultExpandAll = ref<boolean>(true);
  const spinning = ref<boolean>(false);
  const treeData = ref<any[]>();
  const treeList = ref<any[]>([]);

  const pagination = reactive<QueryDataOptions>({
    query: {},
    exp: '',
    sorts: [],
  });

  onMounted(async () => {
    await getBodyBySearchComponent(refSearch.value);
    /**
     * 初始化不加载
     */
    if (initializeLoad.value === false) return;

    await getDataSource({}, ListTreeSearchTypeEnum.LEVEL);
  });

  function list2Tree(list) {
    let treeOptions = [];
    const arrClone: any = cloneDeep(list);
    const mapInfo = arrClone.reduce((obj: any, item: any) => {
      item.children = [];
      obj[item.id_] = item;
      return obj;
    }, {});
    // 转树
    arrClone.forEach((i: any) => {
      const parent = mapInfo[i.parent_id_];
      // 如果父节点存在，push到父级的children数组中
      // 如果父级不存在，直接push到treeData数组
      parent ? parent.children.push(i) : treeOptions.push(i);
    });
    return treeOptions;
  }

  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource(queryData?: QueryDataOptions, searchType?: ListTreeSearchTypeEnum) {
    let { query = {}, parent_id_ } = Object.assign({}, pagination, queryData);
    loading.value = true;
    let list = [];
    try {
      const treeParmse = {};
      let _searchType = searchType;
      if (searchType !== ListTreeSearchTypeEnum.ALL) {
        if (searchType === ListTreeSearchTypeEnum.LEVEL || !searchType) {
          if (defaultExpandLevel.value === 0) {
            _searchType = ListTreeSearchTypeEnum.ALL;
          } else {
            treeParmse['level_.le'] = defaultExpandLevel.value + 1;
          }
        } else if (searchType === ListTreeSearchTypeEnum.CHILDREN) {
          treeParmse['parent_id_.eq'] = parent_id_;
        } else if (Object.keys(query)?.length) {
          _searchType = ListTreeSearchTypeEnum.SEARCH;
        }
      }

      lastQueryData.value = {
        searchType: _searchType || ListTreeSearchTypeEnum.LEVEL,
        query:
          _searchType !== 'CHILDREN'
            ? {
                ...query,
                ...treeParmse,
              }
            : { ...treeParmse },
      };

      let data = (await Event.context.$httpBizService(
        { action: 'listTree', key: model.value, modelCategory: modeldata.value?.modelCategory },
        lastQueryData.value,
      )) as any;

      pagination.query = query;
      list = transformSourceData(data.data, data.dict) as any;
      treeList.value = list.map((i: any) => ({ ...i, key: i.id_, title: i.f_name_szwu }));

      if (searchType !== 'CHILDREN') {
        treeData.value = list2Tree(treeList.value);
        transformExpandKeys(searchType);
      }
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
    return list;
  }

  async function search(queryData?: QueryDataOptions) {
    await getDataSource(queryData, queryData?.searchType);
    merge(pagination, queryData || {});
  }

  async function getBodyBySearchComponent(key: string) {
    if (!key) return {};
    Event.initSearchs(key, search, props.widget.id);
    try {
      let searchVm = (await Event.getSyncComponent(key)) as any;
      let queryData = (await searchVm.getBodyBySearch()) || {};
      merge(pagination, queryData);
    } catch (error) {
      console.warn(error);
    }
  }

  function afterSelect(rows) {
    const findItem = rows[0] ? treeList.value.find((i) => i.id_ == rows[0]) : undefined;
    Event.runEventByName('afterSelect', props.widget.events, findItem, treeList.value);
  }

  /**
   * tree 展开逻辑处理
   */
  async function transformExpandKeys(searchType: ListTreeSearchTypeEnum) {
    await nextTick();
    if (searchType === ListTreeSearchTypeEnum.ALL || searchType === ListTreeSearchTypeEnum.SEARCH) {
      /**全展开和搜索 */
      defaultExpandAll.value = true;
      expandedKeys.value = undefined;
    } else if (
      searchType === ListTreeSearchTypeEnum.LEVEL ||
      searchType === ListTreeSearchTypeEnum.SEARCHALL
    ) {
      if (defaultExpandLevel.value === 0) {
        defaultExpandAll.value = true;
        expandedKeys.value = undefined;
      } else {
        defaultExpandAll.value = false;
        expandedKeys.value = treeList.value
          .filter((i) => i.level_ < defaultExpandLevel.value)
          .map((v) => v.id_);
      }
    }
  }

  defineExpose({
    reload: search,
    getSelectedValue() {
      return selectedKeys.value;
    },
    setSelectedValue(val) {
      selectedKeys.value = val;
    },
    reset() {
      selectedKeys.value = [];
      treeList.value = [];
      treeData.value = [];
    },
    setDataSource(data) {
      transformExpandKeys(ListTreeSearchTypeEnum.ALL);
      treeList.value = cloneDeep(data);
      treeData.value = list2Tree(treeList.value);
    },
    showLoading() {
      spinning.value = true;
    },
    hideLoading() {
      spinning.value = false;
    },
  });
</script>
<style lang="less" scoped>
  .tree-wrapper {
    :deep(.ant-tree-switcher) {
      height: 24px;
      .ant-tree-switcher-icon {
        font-size: 12px;
      }
    }
  }
</style>
