<template>
  <a-select
    v-model:value="currentValue"
    :options="displayOptions"
    :loading="loading && isFirstPage"
    @search="onSearch"
    @clear="onClear"
    @popupScroll="onPopupScroll"
    v-bind="separatorAttr"
  />
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { debounce, throttle } from 'lodash-es';
  import { getEdhrInstanceFindMaterialNo } from '/@/apis/gct-apaas/EdhrInstanceController';
  import type { SelectProps } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      value?: string;
      placeholder?: string;
      /** 是否忽略封存状态 */
      ignoreArchived?: boolean;
    }>(),
    {
      ignoreArchived: true,
    },
  );

  const emit = defineEmits(['update:value']);

  // 选项存储
  const searchOptions = ref<any[]>([]);
  const initialOptions = ref<any[]>([]);
  const cacheOptions = ref<any[]>([]); // 缓存选项用于回显
  const lastSearchValue = ref('');
  const loading = ref(false);
  const loadingMore = ref(false);

  // 独立分页状态
  const paginationStates = ref({
    initial: {
      pageNo: 1,
      totalPage: 1,
      hasMore: true,
    },
    search: {
      pageNo: 1,
      totalPage: 1,
      hasMore: true,
    },
  });

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  const isSearching = computed(() => lastSearchValue.value !== '');

  // 是否是第一页（用于区分初始加载和加载更多）
  const isFirstPage = computed(() => {
    const state = isSearching.value
      ? paginationStates.value.search
      : paginationStates.value.initial;
    return state.pageNo === 1;
  });

  // 回显处理
  watch(
    currentValue,
    async (newVal) => {
      if (newVal && !hasOption(newVal)) {
        await fetchMissingOption(newVal);
      }
    },
    { immediate: true },
  );

  // 当前活动选项
  const activeOptions = computed(() => {
    return isSearching.value ? searchOptions.value : initialOptions.value;
  });

  const displayOptions = computed(() => {
    if (isNoData.value) return []; // 无数据时不显示状态
    // 正常数据选项
    const normalOptions = activeOptions.value
      .filter((opt) => opt.type !== 'status')
      .map((item) => ({
        label: item.label,
        value: item.value,
      }));

    // 状态选项（加载中、无更多数据）
    const statusOptions: any[] = [];

    // 只有当有数据时才显示加载更多状态
    if (activeOptions.value.length > 0) {
      if (loading.value || loadingMore.value) {
        statusOptions.push({
          label: loading.value ? $t('sys.loadingText') : $t('sys.edhr.loadingMore'),
          value: 'loading_status',
          disabled: true,
          type: 'status',
        });
      } else if (!currentHasMore.value) {
        statusOptions.push({
          label: $t('sys.noMoreData'),
          value: 'no_more_status',
          disabled: true,
          type: 'status',
        });
      }
    }

    return [...normalOptions, ...statusOptions];
  });

  // 当前分页状态
  const currentHasMore = computed(() => {
    const state = isSearching.value
      ? paginationStates.value.search
      : paginationStates.value.initial;
    return state.hasMore;
  });

  // 无数据状态
  const isNoData = computed(() => {
    return !loading.value && activeOptions.value.length === 0;
  });

  const separatorAttr = computed(
    (): SelectProps => ({
      placeholder: props.placeholder || $t('sys.chooseText'),
      dropdownMatchSelectWidth: 180,
      dropdownClassName: 'gct-project-select-dropdown vxe-table--ignore-clear',
      allowClear: true,
      showSearch: true,
      defaultActiveFirstOption: false,
      filterOption: false,
      notFoundContent: isNoData.value ? $t('sys.edhr.noSearchResult') : undefined,
    }),
  );

  onMounted(async () => {
    await fetchInitialData(true);
  });

  // 检查选项是否存在
  const hasOption = (value: string) => {
    return [...initialOptions.value, ...cacheOptions.value, ...searchOptions.value].some(
      (opt) => opt.value === value,
    );
  };

  // 获取缺失的选项（用于回显）
  const fetchMissingOption = async (value: string) => {
    try {
      const res = await getEdhrInstanceFindMaterialNo({
        materialNo: value,
        ignoreArchived: props.ignoreArchived,
        pageNo: 1,
        pageSize: 1,
      });

      if (res?.data?.[0]) {
        const item = res.data[0];
        const option = {
          label: item.materialNo as string,
          value: item.materialNo as string,
          type: 'data',
        };
        cacheOptions.value = [option, ...cacheOptions.value];
        initialOptions.value = [option, ...initialOptions.value];
      }
    } catch (error) {
      console.error('获取回显数据失败:', error);
    }
  };

  const mergeOptions = (existing: any[], newItems: any[]) => {
    const map = new Map();
    [...existing, ...newItems].forEach((item) => {
      if (!map.has(item.value)) {
        map.set(item.value, item);
      }
    });
    return Array.from(map.values());
  };

  // 获取初始数据
  const fetchInitialData = async (resetPage = true) => {
    if (loading.value) return;
    loading.value = true;
    const state = paginationStates.value.initial;
    try {
      if (resetPage) state.pageNo = 1;

      const res = await getEdhrInstanceFindMaterialNo({
        materialNo: '',
        ignoreArchived: props.ignoreArchived,
        pageNo: state.pageNo,
        pageSize: 20,
      });

      if (res?.data) {
        const newOptions = res.data.map((item) => ({
          label: item.materialNo as string,
          value: item.materialNo as string,
          type: 'data',
        }));

        state.totalPage = res.totalPage || 1;
        state.hasMore = state.pageNo < state.totalPage;

        if (resetPage) {
          initialOptions.value = mergeOptions(cacheOptions.value, newOptions);
        } else {
          initialOptions.value = mergeOptions(initialOptions.value, newOptions);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      state.hasMore = false;
    } finally {
      loading.value = false;
    }
  };

  // 获取搜索数据
  const fetchSearchData = async (searchVal: string, resetPage = true) => {
    if (loading.value) return;
    loading.value = true;
    const state = paginationStates.value.search;
    try {
      if (resetPage) state.pageNo = 1;

      const res = await getEdhrInstanceFindMaterialNo({
        materialNo: searchVal,
        ignoreArchived: props.ignoreArchived,
        pageNo: state.pageNo,
        pageSize: 20,
      });

      if (res?.data) {
        const newOptions = res.data.map((item) => ({
          label: item.materialNo as string,
          value: item.materialNo as string,
          type: 'data',
        }));

        state.totalPage = res.totalPage || 1;
        state.hasMore = state.pageNo < state.totalPage;

        if (resetPage) {
          searchOptions.value = newOptions;
        } else {
          searchOptions.value = [...searchOptions.value, ...newOptions];
        }
      } else {
        searchOptions.value = [];
      }
    } catch (error) {
      console.error('加载搜索数据失败:', error);
      searchOptions.value = [];
      state.hasMore = false;
    } finally {
      loading.value = false;
    }
  };

  // 滚动事件处理
  const onPopupScroll = throttle((e: Event) => {
    if (loading.value || loadingMore.value || !currentHasMore.value) return;

    const target = e.target as HTMLElement;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom <= 30) {
      loadMoreData();
    }
  }, 200);

  // 滚动加载更多
  const loadMoreData = async () => {
    loadingMore.value = true;

    try {
      const state = isSearching.value
        ? paginationStates.value.search
        : paginationStates.value.initial;

      state.pageNo++;

      if (isSearching.value) {
        await fetchSearchData(lastSearchValue.value, false);
      } else {
        await fetchInitialData(false);
      }
    } catch (error) {
      console.error('加载更多数据失败:', error);
    } finally {
      loadingMore.value = false;
    }
  };

  // 搜索处理
  const DEBOUNCE_TIME = 500;
  const debouncedSearch = debounce((val: string) => {
    lastSearchValue.value = val.trim();

    if (lastSearchValue.value) {
      fetchSearchData(lastSearchValue.value, true);
    } else {
      // 清空搜索时恢复初始数据
      // fetchInitialData(true);
    }
  }, DEBOUNCE_TIME);

  const onSearch = (val: string) => {
    debouncedSearch(val);
  };

  const onClear = () => {
    lastSearchValue.value = '';
    // fetchInitialData(true);
  };
</script>
