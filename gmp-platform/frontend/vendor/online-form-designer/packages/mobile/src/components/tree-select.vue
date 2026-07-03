<template>
  <van-popover v-model:show="showPopover" placement="bottom-end">
    <div class="w300px h300px overflow-y-auto">
      <PureTree :nodes="treeNodes" @node-arrow-click="onArrowClick" @node-click="onNodeClick">
        <template #node="{ node }">
          <div class="ks-row w100%">
            <div class="ks-col ell text-[#1A1D23]"> {{ node.name }}</div>
            <span v-if="node.selected" class="gct-iconfont icon-duigou-da"></span>
          </div>
        </template>
      </PureTree>
    </div>
    <template #reference>
      <slot></slot>
    </template>
  </van-popover>
</template>

<script setup lang="tsx">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { PureTree, type IPureTreeNode } from '@gct/nocode-mobile-render';

  const props = defineProps<{
    treeData: any[];
    treeProps: Record<string, any>;
    modelValue: string;
  }>();
  const emit = defineEmits<{
    (e: 'modelValue', id: string): void;
    (e: 'change', node: { id: string; option: any }): void;
  }>();
  const showPopover = ref(false);

  const selectedNodeId = computed({
    get() {
      return props.modelValue;
    },
    set(id) {
      emit('modelValue', id);
    },
  });
  const cacheExpanded = reactive<Record<string, boolean>>({});
  const onArrowClick = (node: any) => {
    cacheExpanded[node.id] = !node.expanded;
  };
  function recursiveToNode(node): IPureTreeNode & { __origin: object } {
    return {
      id: node.id!,
      name: node.name!,
      expanded: cacheExpanded[node.id!] ?? true,
      __origin: node,
      children: node.child?.map(recursiveToNode),
      selected: selectedNodeId.value === node.id,
    };
  }
  function onNodeClick(node) {
    selectedNodeId.value = node.id;
    console.log('onNodeClick', node);
    showPopover.value = false;
    emit('change', { id: node.id, option: node.__origin });
  }
  const treeNodes = computed(() => {
    return props.treeData.map(recursiveToNode);
  });

  onMounted(() => {
    console.log('treeData', props.treeData);
  });
</script>
<style lang="less">
  .gct-tree-node {
    &:hover {
      background-color: rgb(from var(--van-primary-color) r g b / 10%);
      color: var(--van-primary-color);
    }
  }
</style>
