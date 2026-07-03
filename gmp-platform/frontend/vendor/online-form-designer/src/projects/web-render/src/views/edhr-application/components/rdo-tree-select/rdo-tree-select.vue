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
    :disabled="disabled"
    v-bind="attr || {}"
    dropdown-class-name="vxe-table--ignore-clear"
    @change="onChange"
  />
</template>

<script setup lang="ts" name="rdo-tree-select">
  import { computed, onMounted, ref } from 'vue';
  import { useAsyncOptions } from './hook';
  import { debounce } from 'lodash-es';
  import { watchDebounced } from '@vueuse/core';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      modelCategory?: string;
      modelKey: string;
      placeholder?: string;
      /** 父不能选择 */
      disabledParent?: boolean;
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault?: boolean;
      disabled?: boolean;
      attr?: {
        [key: string]: any;
      };
    }>(),
    {
      placeholder: $t('sys.appDesigner.pleaseSelect'),
      modelCategory: 'entity',
      parentToDefault: true,
    },
  );

  const emit = defineEmits(['update:modelValue', 'update:fullPathValue', 'change']);

  const searchValue = ref();

  const { getChildrens, getAsyncOptions, treeData } = useAsyncOptions({
    bindModelKey: props.modelKey,
    modelCategory: props.modelCategory,
  });

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
      modelCategory: props.modelCategory,
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

  /** 用来返回完整路径id */
  function onChange(value, _, node) {
    if (value) {
      const [_fId, _cId] = value?.split(':');

      /** 开启了选中父抛默认版本后，当没有子版本id时，拼接默认子版本id */
      if (props.parentToDefault && !_cId) {
        emit('update:fullPathValue', `${value}:${node.triggerNode.props._info.id_}`);
        emit('change', `${value}:${node.triggerNode.props._info.id_}`, node);
      } else {
        emit('update:fullPathValue', value);
        emit('change', value, node);
      }
    } else {
      emit('update:fullPathValue', null);
      emit('change', null, node);
    }
  }
</script>
<style lang="less" scoped></style>
