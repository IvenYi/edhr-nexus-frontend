<template>
  <a-tree-select
    :class="[ns.b()]"
    :value="value"
    @update:value="emit('update:value', $event)"
    :tree-data="treeData"
    tree-default-expand-all
    size="small"
  />
</template>

<script lang="ts" setup name="EdhrOutline">
  import { computed } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { ITreeNode } from '../type';
  import { DefaultOptionType } from 'ant-design-vue/es/select';

  const ns = useNamespace('edhr-outline-select');

  const props = withDefaults(
    defineProps<{
      value?: string;
      treeData: ITreeNode[];
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined): void;
  }>();

  /**
   * 转换为ant的树形选项结构
   */
  function toTreeOptions(nodes: ITreeNode[]): DefaultOptionType[] {
    const result: DefaultOptionType[] = [];
    nodes.forEach((node) => {
      const item: DefaultOptionType = {
        value: node.key,
        label: node.title,
      };
      // 递归子节点
      if (node.children) {
        item.children = toTreeOptions(node.children);
      }
      result.push(item);
    });
    return result;
  }

  const treeData = computed(() => {
    return toTreeOptions(props.treeData);
  });
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-select) {
    width: 100%;
  }
</style>
