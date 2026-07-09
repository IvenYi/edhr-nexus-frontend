<template>
  <a-select
    :value="value"
    :options="options"
    @popupScroll="popupScroll"
    @search="debouncedSearch"
    @change="handleChange"
    @focus="handleFocus"
    v-bind="separatorAttr"
  />
</template>
<script setup lang="ts" name="request-select-cmp">
  import { ref, onBeforeMount, nextTick, computed } from 'vue';
  import { debounce } from 'lodash-es';
  import { getModelMetaInfo } from '/@/apis/gct-apaas/ModelMetaController';
  import type { SelectProps } from 'ant-design-vue';

  const SEARCH_DEBOUNCE_MS = 200;

  interface OptionItem {
    label: string;
    value: string;
  }

  interface Props {
    value?: string | string[];
    api: (params: Record<string, any>) => Promise<any>;
    apiParams: Record<string, any>;
  }

  const emit = defineEmits(['update:pageNo', 'update:value']);
  const props = defineProps<Props>();
  const options = ref<OptionItem[]>([]);
  const lastSearchValue = ref('');
  const displayField = ref<string>('name_');
  const value = computed(() => props.value || []);

  function toOption(item: any): OptionItem {
    return {
      label: item.__LABEL__ ?? item.text ?? item.name_ ?? item.name ?? '',
      value: item.id_ ?? item.value ?? item.key ?? item.id ?? '',
    };
  }

  const filterOption = (input: string, option: any) => {
    if (option.label) {
      return option.label.toLowerCase().includes(input.toLowerCase());
    } else {
      return option.value?.toLowerCase().includes(input.toLowerCase());
    }
  };

  // const isEnumFn = computed(() => {
  //   return (
  //     props.api?.name === 'getEnumModelFieldPageList' ||
  //     Object.keys(props.apiParams)?.includes('enumModelKey')
  //   );
  // });

  const hasPageNo = computed(() => {
    return Object.keys(props.apiParams)?.includes('pageNo');
  });

  const separatorAttr = computed(
    (): SelectProps => ({
      showSearch: true,
      filterOption: !hasPageNo.value ? filterOption : false,
      maxTagTextLength: 2,
      maxTagCount: 'responsive',
    }),
  );

  async function fetchOptions(params: Record<string, any>): Promise<OptionItem[]> {
    if (typeof props.api !== 'function') return [];
    const result = await props.api({ ...(params ?? {}) });
    const list = Array.isArray(result) ? result : (result?.data ?? []);
    return list.map(toOption);
  }

  function getSearchParams(keyword: string): Record<string, any> {
    if (!keyword?.trim()) return props.apiParams ?? {};
    const queryName = `${displayField.value}.ilike`;
    return {
      ...props.apiParams,
      query: { [queryName]: keyword.trim() },
      exp: `OR(${queryName})`,
    };
  }

  async function getModelInfo() {
    const { bindModelKey } = props.apiParams ?? {};
    if (bindModelKey) {
      const res = (await getModelMetaInfo({ id: bindModelKey })) || {};
      displayField.value = res.displayField || 'name_';
    }
  }

  /** 下拉触底分页 */
  async function popupScroll(e: Event) {
    const target = e.target as HTMLElement;
    if (target.scrollTop + target.offsetHeight !== target.scrollHeight) return;
    const { pageNo = 1, pageSize = 10 } = props.apiParams ?? {};
    if (pageNo * pageSize > options.value.length) return;
    emit('update:pageNo');
    await nextTick();

    const params = getSearchParams(lastSearchValue.value ?? '');
    const opts = await fetchOptions(params ?? {});
    const existingValues = new Set(options.value.map((j) => j.value));
    const newOpts = opts.filter((i) => !existingValues.has(i.value));
    if (newOpts.length) options.value = [...options.value, ...newOpts];
  }

  const debouncedSearch = debounce(async (val: string) => {
    if (!hasPageNo.value) return;
    lastSearchValue.value = val.trim();
    emit('update:pageNo', 1);
    const params = getSearchParams(lastSearchValue.value);
    options.value = await fetchOptions(params);
  }, SEARCH_DEBOUNCE_MS);

  const handleChange = async (val: string | string[]) => {
    emit('update:value', val);
    if ((!val || val.length === 0) && hasPageNo.value) {
      emit('update:pageNo', 1);
      options.value = await fetchOptions(props.apiParams ?? {});
    }
  };

  const handleFocus = async () => {
    if (!hasPageNo.value) return;
    if ((!value.value || value.value.length === 0) && lastSearchValue.value) {
      emit('update:pageNo', 1);
      options.value = await fetchOptions(props.apiParams ?? {});
    }
    lastSearchValue.value = '';
  };

  onBeforeMount(async () => {
    getModelInfo();
    options.value = await fetchOptions(props.apiParams ?? {});
  });
</script>
