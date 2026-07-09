<template>
  <a-auto-complete
    v-model:value="currentValue"
    :options="state.data"
    v-bind="autoCompleteAttrs"
    @search="handleSearch"
  >
    <template v-if="state.fetching" #notFoundContent>
      <div class="h-120px flex items-center justify-center">
        <a-spin size="small" />
      </div>
    </template>
  </a-auto-complete>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive } from 'vue';
  import { debounce } from 'lodash-es';
  import { getEdhrInstanceFindMaterialNo } from '/@/apis/gct-apaas/EdhrInstanceController';
  import type { AutoCompleteProps } from 'ant-design-vue';

  type Option = { label: string; value: string };

  const props = withDefaults(
    defineProps<{
      value?: string;
      placeholder?: string;
      /** 是否忽略封存状态 */
      ignoreArchived?: boolean;
    }>(),
    {
      placeholder: '请输入或选择',
      ignoreArchived: true,
    },
  );

  const emit = defineEmits(['update:value']);

  const state = reactive<{
    hasSearched: boolean;
    data: Option[];
    initialData: Option[];
    fetching: boolean;
  }>({
    hasSearched: false,
    data: [],
    initialData: [],
    fetching: false,
  });

  const currentValue = computed<string | undefined>({
    get: () => props.value,
    set: (val) => emit('update:value', val),
  });

  const autoCompleteAttrs = computed<AutoCompleteProps>(() => ({
    placeholder: props.placeholder,
    allowClear: true,
    dropdownMatchSelectWidth: 180,
    dropdownClassName: 'gct-project-select-dropdown vxe-table--ignore-clear',
    filterOption: false,
  }));

  function mapToOption(arr: any[]): Option[] {
    return arr.map((i: any) => ({ label: i.materialNo, value: i.materialNo }));
  }

  async function fetchOptions(keyword = '', pageNo = 1, pageSize = 99): Promise<Option[]> {
    const res = await getEdhrInstanceFindMaterialNo({
      materialNo: keyword,
      ignoreArchived: props.ignoreArchived,
      pageNo,
      pageSize,
    });

    return mapToOption(res?.data ?? []);
  }

  // 搜索处理
  const handleSearch = (keyword?: string) => {
    state.hasSearched = true;
    state.fetching = true;
    state.data = [];
    debounceSearch(keyword);
  };

  const debounceSearch = debounce(async (keyword: string = '') => {
    try {
      if (keyword && keyword.trim()) {
        // 只走远程请求
        state.data = await fetchOptions(keyword, 1, 99);
      } else {
        // 清空搜索时恢复初始或加载已选
        await checkInitialValue();
      }
    } catch (err) {
      console.error('请求失败:', err);
    } finally {
      state.fetching = false;
    }
  }, 300);

  async function checkInitialValue() {
    if (currentValue.value && !state.initialData.some((o) => o.value === currentValue.value)) {
      const arr = await fetchOptions(currentValue.value, 1, 1);
      state.data = [...arr, ...state.initialData];
    } else {
      state.data = state.initialData;
    }
    state.hasSearched = false;
  }

  async function fetchInitialData() {
    if (state.fetching) return;
    state.fetching = true;
    try {
      const options = await fetchOptions('', 1, 999);

      state.initialData = options;
      state.data = options;
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      state.fetching = false;
    }
  }

  onMounted(async () => {
    await fetchInitialData();
  });
</script>

<style scoped></style>
