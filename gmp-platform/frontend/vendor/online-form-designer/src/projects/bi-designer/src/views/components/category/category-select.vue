<template>
  <div :class="[ns.b()]">
    <a-tree-select
      :value="value"
      @update:value="(v) => emit('update:value', v)"
      :tree-data="treeData"
      tree-default-expand-all
      :disabled="disabled"
      :allow-clear="true"
      dropdown-class-name="gct-custom-select-dropdown"
    />
  </div>
</template>

<script lang="ts" setup name="category-select">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { useCategory } from './hooks/useCategory';
  import { CategoryModuleEnum } from './type';
  import { DefaultOptionType } from 'ant-design-vue/es/select';
  import { computed, onMounted } from 'vue';
  import { recursiveTransfer } from '/@/utils/recursive';

  const ns = useNamespace('category-select');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value?: string;
      module: CategoryModuleEnum;
      disabled?: boolean;
      /** 默认选中第一个分类并抛出值变更 */
      defaultSelectedFirst?: boolean;
    }>(),
    {
      value: undefined,
      disabled: false,
      defaultSelectedFirst: false,
    },
  );
  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
  }>();

  const { categoryTreeData, load } = useCategory({ module: props.module });

  const treeData = computed(() => {
    if (!categoryTreeData.value) return [];
    return recursiveTransfer(categoryTreeData.value, (item, resolveChild) => {
      const node: DefaultOptionType = {
        value: item.id!,
        label: item.name!,
      };
      if (item.child) {
        node.children = resolveChild(item.child);
      }
      return node;
    });
  });

  // 如果没有数据加载一下
  onMounted(async () => {
    if (!categoryTreeData.value?.length) {
      await load();
    }
    if (props.defaultSelectedFirst && !props.value) {
      const firstCategoryId = categoryTreeData.value?.[0]?.id;
      if (firstCategoryId) {
        emit('update:value', firstCategoryId);
      }
    }
  });
</script>

<style lang="scss" scoped>
  $category-select: (
    height: auto,
  );

  @include b(category-select) {
    @include set-component-css-var(category-select, $category-select);
    height: getCssVar(category-select, height);
  }
</style>
