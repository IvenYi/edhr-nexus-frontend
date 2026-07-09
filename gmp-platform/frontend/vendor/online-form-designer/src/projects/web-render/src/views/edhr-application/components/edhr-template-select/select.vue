<template>
  <a-tree-select
    v-model:value="value"
    v-model:searchValue="searchValue"
    style="width: 100%"
    :tree-data="actualTreeData"
    show-search
    :placeholder="placeholder"
    :allowClear="true"
    treeNodeLabelProp="full_path"
    :virtual="false"
    @search="search"
    :filterTreeNode="() => true"
    dropdown-class-name="vxe-table--ignore-clear"
  />
</template>

<script setup lang="ts" name="edhr-template-select">
  import { computed, onMounted, ref } from 'vue';
  import { useAsyncOptions } from './hook';
  import { debounce } from 'lodash-es';
  import { watchDebounced } from '@vueuse/core';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      placeholder?: string;
      /** 父不能选择 */
      disabledParent?: boolean;
    }>(),
    {
      placeholder: '请选择',
    },
  );

  const emit = defineEmits(['update:modelValue']);

  const searchValue = ref();

  const { getChildrens, getAsyncOptions, treeData } = useAsyncOptions();

  const actualTreeData = computed(() => {
    return treeData.value?.map((item) => {
      return { ...item, selectable: !props.disabledParent };
    });
  });

  const value = computed<any>({
    get() {
      return props.modelValue || undefined;
    },
    set(v) {
      emit('update:modelValue', v || null);
    },
  });

  async function getOptionsByQuery(opts: Record<string, any> = {}): Promise<void> {
    await getAsyncOptions({
      moduleType: 'edhr_module',
      categoryId: '',
      pageSize: 9999,
      queryData: { ...opts.queryData },
      ...opts,
    });
  }

  onMounted(getOptionsByQuery);

  watchDebounced(
    value,
    async (v) => {
      /** 监听如果分业内不存在id 就手动查询 */
      try {
        await getChildrens(value.value);
      } catch (error) {
        console.log(error);
      }
    },
    { debounce: 200, immediate: true },
  );

  const search = debounce(async (keyword) => {
    await getOptionsByQuery({ keyword, pageNo: 1 });
    if (!keyword) {
      /**選中後初始化选项 */
      await getChildrens(value.value);
    }
  }, 200);
</script>
<style lang="less" scoped></style>
