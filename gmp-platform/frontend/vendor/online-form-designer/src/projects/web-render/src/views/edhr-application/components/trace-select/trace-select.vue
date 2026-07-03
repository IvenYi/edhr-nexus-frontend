<template>
  <a-select
    v-model:value="currentValue"
    :options="state.data"
    v-bind="separatorAttr"
    @search="handleSearch"
  >
    <template #dropdownRender="{ menuNode: menu }">
      <v-nodes :vnodes="menu" />
      <div
        class="search-more"
        v-if="state.data.length && !state.loadFinished2Options && !state.hasSearched"
        >{{ $t('sys.onlineForm.searchForMore') }}</div
      >
    </template>
    <template v-if="state.fetching" #notFoundContent>
      <div class="h-120px">
        <a-spin size="small" />
      </div>
    </template>
  </a-select>
</template>

<script setup lang="ts" name="trace-select">
  import { computed, reactive, defineComponent, onBeforeMount, watch } from 'vue';
  import { EntityModelCategoryEnum, FIELD_TYPE } from '@gct/runtime';
  import { debounce, isNil } from 'lodash-es';
  import { useAsyncOptions } from './utils';
  import type { SelectProps } from 'ant-design-vue';

  const searchFieldMap = {
    [FIELD_TYPE.DEVICE]: 'name_',
    [FIELD_TYPE.MFG_ORDER]: 'code_',
    [FIELD_TYPE.PRODUCT_FAMILY]: 'name_',
  };

  const VNodes = defineComponent({
    props: {
      vnodes: {
        type: Object,
        required: true,
      },
    },
    render() {
      return this.vnodes;
    },
  });

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      modelCategory?: string;
      modelKey: string;
      placeholder?: string;
      fieldType: FIELD_TYPE;
    }>(),
    {
      placeholder: $t('sys.appDesigner.pleaseSelect'),
      modelCategory: EntityModelCategoryEnum.ENTITY,
      parentToDefault: true,
    },
  );

  const emit = defineEmits(['update:modelValue']);
  const searchField = searchFieldMap[props.fieldType] || 'name_';
  const { getRefList, getOptionByIds } = useAsyncOptions({
    bindModelKey: props.modelKey,
    modelCategory: props.modelCategory,
    code: searchField,
  });

  const state = reactive<{
    /** 标记是否进行过搜索 */
    hasSearched: boolean;
    /** 下拉列表数据 */
    data: any;
    initialOptions: any;
    /** 请求loading */
    fetching: boolean;
    loadFinished2Options: boolean;
  }>({
    hasSearched: false,
    data: [],
    initialOptions: [],
    fetching: false,
    loadFinished2Options: true,
  });

  const currentValue = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });

  watch(
    () => currentValue.value,
    async () => {
      if (!state.loadFinished2Options) {
        await checkInitialValue();
      }
    },
    {
      immediate: true,
    },
  );

  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: props.placeholder,
      dropdownMatchSelectWidth: 180,
      dropdownClassName: 'gct-project-select-dropdown vxe-table--ignore-clear',
      allowClear: true,
      showSearch: true,
      defaultActiveFirstOption: false,
      filterOption: state.loadFinished2Options ? onFilterOption : false,
      notFoundContent: undefined,
    };
    return attr;
  });

  async function getOptionsByQuery(opts: Record<string, any> = {}): Promise<any> {
    return await getRefList({
      pageSize: 999,
      queryData: { ...opts.queryData },
      ...opts,
    });
  }

  onBeforeMount(async () => {
    const { options, finished } = await getOptionsByQuery();
    state.loadFinished2Options = finished;
    state.initialOptions = options;
    state.data = options || [];
  });

  function onFilterOption(input: string, option: any) {
    if (option.label) {
      const options = option._item;
      const label = option?.__LABEL__ || options[searchField];
      const code = options['code_'];
      const keyword = input.toLowerCase();
      return [label, code].some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(keyword),
      );
    }
    return false;
  }

  const handleSearch = (keyword?: string) => {
    if (state.loadFinished2Options) return;

    state.hasSearched = true;
    state.fetching = true;
    state.data = [];
    debounceSearch(keyword);
  };

  const debounceSearch = debounce(async (keyword) => {
    try {
      if (keyword && keyword.trim()) {
        // 本地过滤
        // const localResults = (state.initialOptions || []).filter((opt) => {
        //   if (opt.label) {
        //     return opt.label.toLowerCase().includes(keyword.toLowerCase());
        //   }
        //   return false;
        // });
        // if (localResults.length > 0) {
        //   state.data = localResults;
        // }
        const queryName = `${searchField}.like`;
        const codeName = 'code_.like';
        const res = await getOptionsByQuery({
          exp: `OR(${queryName},${codeName})`,
          queryData: { [queryName]: keyword, [codeName]: keyword },
          pageSize: 30,
        });

        state.data = res.options ?? [];
      }
      if (!keyword) {
        await checkInitialValue();
      }
    } catch (error) {
      console.error('请求失败:', error);
    } finally {
      state.fetching = false;
    }
  }, 300);

  /** 判断是否存在 不存在需要拼接 */
  async function checkInitialValue() {
    if (currentValue.value && !state.initialOptions.some((o) => o.value === currentValue.value)) {
      const remoteOption = await getOptionByIds(currentValue.value);
      state.data = [...remoteOption, ...state.initialOptions];
    } else {
      state.data = state.initialOptions;
    }
    state.hasSearched = false;
  }
</script>

<style scoped lang="less">
  .search-more {
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 24px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    border-top: 1px solid #e9e9e9;
    margin-top: 4px;
    padding-top: 4px;
  }
</style>
