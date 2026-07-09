<template>
  <a-tree-select
    :value="value"
    v-model:searchValue="searchValue"
    style="width: 100%"
    :tree-data="treeData"
    show-search
    :allowClear="true"
    multiple
    treeNodeLabelProp="full_path"
    :showCheckedStrategy="TreeSelect.SHOW_ALL"
    maxTagCount="responsive"
    :maxTagTextLength="2"
    :virtual="false"
    @search="search"
    :filterTreeNode="() => true"
    dropdown-class-name="vxe-table--ignore-clear"
  >
    <template #maxTagPlaceholder="omittedValues">
      <a-tooltip :title="getOmittedText(omittedValues)">
        <span>+{{ omittedValues?.length }}</span>
      </a-tooltip>
    </template>
  </a-tree-select>
</template>

<script setup lang="ts">
  import { computed, onBeforeMount, ref } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { useAsyncOptions } from '../../../hooks/useRdoHooks';
  import { debounce } from 'lodash-es';
  import { watchDebounced } from '@vueuse/core';

  const props = withDefaults(
    defineProps<{
      value?: string[];
      apiParams: any;
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault?: boolean;
    }>(),
    {
      parentToDefault: true,
    },
  );

  const searchValue = ref();

  const { getChildrens, getAsyncOptions, treeData } = useAsyncOptions({
    bindModelKey: props.apiParams.modelKey,
    modelCategory: 'entity',
  });

  async function getOptionsByQuery(opts: Record<string, any> = {}): Promise<void> {
    await getAsyncOptions({
      modelCategory: 'entity',
      pageSize: 9999,
      queryData: { ...opts.queryData },
      ...opts,
    });
  }

  onBeforeMount(getOptionsByQuery);

  watchDebounced(
    () => props.value,
    async (v) => {
      /** 监听如果分业内不存在id 就手动查询 */
      try {
        await getChildrens(v);
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
      await getChildrens(props.value);
    }
  }, 200);

  function getOmittedText(omitted) {
    return omitted.map((v) => v.label?.children?.map((i) => i.children)?.join(':')).join(', ');
  }
</script>
<style lang="less" scoped></style>
