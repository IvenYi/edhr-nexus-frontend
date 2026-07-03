<template>
  <van-search
    v-if="showSearch"
    class="app-quick-search"
    v-model="keyword"
    label=""
    :placeholder="searchPlaceholder"
    @search="onSearch"
    @click-right-icon="onSearch"
  >
    <template #left-icon> </template>
    <template #right-icon>
      <van-icon name="search" />
    </template>
  </van-search>
  <van-list
    v-model:loading="loading"
    :finished="finished"
    finished-text="没有更多了"
    @load="onLoad"
  >
    <van-cell v-for="item in datasource" :key="item" is-link>
      <template #title>
        <cell-item
          :row="item"
          :showField="showField"
          :showFieldExp="showFieldExp"
          :showFieldExpVal="showFieldExpVal"
        />
      </template>
    </van-cell>
  </van-list>
</template>

<script name="gct-data-list" setup lang="ts">
  import { reactive, ref, toRef } from 'vue';
  import { useQueryfilter, getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import CellItem from './cell-item.vue';

  const props = defineProps<{ widget: CardList }>();

  const {
    showSearch,
    searchPlaceholder,
    model,
    modeldata,
    searchField,
    collationField,
    showField,
    collationSort,
    collation,
    datafilter,
    showFieldExp,
    showFieldExpVal,
  } = reactive(props.widget.props);

  const Event = getPageEvent();
  const datasource = ref<any[]>([]);
  const loading = ref(false);
  const finished = ref(false);
  const queryfilter = useQueryfilter(datafilter);
  const querySort = getQuerySort({ collationField, collationSort, collation });
  const total = ref(0);
  const refreshing = ref(false);
  const keyword = ref('');

  const pagination = reactive({
    pageSize: 5,
    pageNo: 0,
    query: {},
    exp: '',
    sorts: [],
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

  const onLoad = async () => {
    pagination.pageNo++;
    await getDataSource();
  };

  async function getDataSource(queryData?) {
    let { pageNo, pageSize, sorts } = Object.assign({}, pagination, queryData);
    loading.value = true;
    try {
      let data = (await Event.context.$httpBizService(
        {
          action: 'listByPage',
          key: model,
          modelCategory: modeldata?.modelCategory,
        },
        {
          query: { ...fieldLikeData.value, ...queryfilter.query },
          exp: queryfilter.getExp(exp),
          pageNo,
          pageSize,
          sorts: [...sorts, ...querySort],
        },
      )) as any;
      pagination.pageNo = data.pageNo;
      pagination.pageSize = data.pageSize;
      total.value = data.totalCount;
      datasource.value.push(
        ...transformSourceData(data.data, data.dict).map((i) => {
          return { ...i };
        }),
      );
    } catch (error) {
      console.log(error);
    }
    refreshing.value = false;
    if (datasource.value.length >= total.value) {
      finished.value = true;
    }
    loading.value = false;
  }

  const onSearch = async (params) => {
    finished.value = false;
    pagination.pageNo = 0;
    datasource.value = [];
    await onLoad();
  };
</script>

<style lang="less" scoped>
  :deep(.van-cell__title) {
    width: 90%;
    div {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      -moz-box-orient: vertical;
      box-orient: 1;
    }
  }

  :deep(.app-quick-search.van-search) {
    background: inherit;

    .van-search__content .van-search__field {
      padding: 0 8px 0 0 !important;

      .van-field__left-icon {
        border-right: 1px solid #f0f0f0;
        color: var(--van-primary-color);

        .van-icon {
          margin-right: 4px;
        }
      }
    }
  }
</style>
