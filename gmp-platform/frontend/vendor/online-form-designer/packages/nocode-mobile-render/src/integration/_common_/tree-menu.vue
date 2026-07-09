<template>
  <div class="mobile-tree-menu">
    <Scrollbar class="p-8px">
      <PureTree
        class="mobile-edhr-menu-tree"
        :nodes="treeNodes"
        @node-click="onNodeClick"
        @node-arrow-click="onArrowClick"
      >
        <template #node="{ node }">
          <i v-if="node.__origin.type === 'DOC'" class="doc-icon">
            <img :src="InstanceStatusIconMap[node.__origin.instanceStatus]" alt="" srcset="" />
          </i>
          <NodeTitle :title="node.name" :tooltip="node.name" />
          <i
            v-if="node.__origin.type === 'DOC'"
            :class="['iconfont', 'icon-Frame', node.__origin.formType]"
            title="实例列表"
            @click.stop="openInstance(node.__origin)"
          ></i>
        </template>
      </PureTree>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { PureTree, IPureTreeNode, NodeTitle } from '../../components/_common_/pure-tree';
  import { InstanceStatusIconMap } from '../instance-status/instance-status-icons';
  import type { IWikiTreeData } from '@gct/nocode-base';

  const props = defineProps<{
    /** wiki目录树 */
    wikiTreeData: IWikiTreeData[];
    /** 选择的表单信息 */
    treeSelectDocData?: any;
  }>();

  const emit = defineEmits<{
    (e: 'select', data: any): void;
    (e: 'openInstance', data: any): void;
  }>();

  const cacheExpanded = reactive({});

  const selectedId = computed(() => props.treeSelectDocData?.id || '');

  const treeNodes = computed(() => {
    return props.wikiTreeData.map(recursiveToNode);
  });

  function recursiveToNode(wikiNode: IWikiTreeData): IPureTreeNode & { __origin: IWikiTreeData } {
    return {
      id: wikiNode.id!,
      name: wikiNode.name!,
      expanded: cacheExpanded[wikiNode.id!] ?? true,
      selected: selectedId.value === wikiNode.id,
      __origin: wikiNode,
      children: wikiNode.children?.map(recursiveToNode),
    };
  }

  const onArrowClick = (node) => {
    console.log('onArrowClick', node);
    cacheExpanded[node.id] = !node.expanded;
  };

  function onNodeClick(node) {
    if (node.__origin.type === 'OUTLINE') {
      cacheExpanded[node.id] = !node.expanded;
      return;
    }
    console.log('onNodeClick', node);
    emit('select', node.__origin);
  }

  function openInstance(data) {
    emit('openInstance', data);
  }
</script>

<style scoped lang="less">
  .mobile-tree-menu {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    flex: 1;

    .doc-icon {
      width: 16px;
      height: 16px;
      line-height: 1;
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
    }

    .node-title {
      width: 100%;
    }

    .icon-Frame {
      width: 24px;
      height: 24px;
      justify-content: flex-end;
      align-items: center;
      color: #026ac8;
      line-height: 1;
      flex-shrink: 0;
      display: none;
    }

    :deep(.pure-tree) {
      --pure-tree__selected-color: #026ac8;
      --pure-tree__selected-bg-color: rgba(0, 153, 255, 0.08);
      .pure-tree__node-wrapper-content {
        --pure-tree__text-color: #1a1d23;
      }
      .node-arrow {
        --node-arrow-color: #1a1d23;
      }

      .pure-tree__node-wrapper.pure-tree__node-wrapper--selected {
        .icon-Frame {
          &.BASE,
          &.PROCESS,
          &.FILE {
            display: flex;
          }
        }
      }
    }
  }
</style>
