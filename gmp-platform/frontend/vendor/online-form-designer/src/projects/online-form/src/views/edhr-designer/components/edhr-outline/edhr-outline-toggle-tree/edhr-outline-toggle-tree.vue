<template>
  <div :class="[ns.b(), isEdit ? ns.m('edit') : ns.m('info')]" @click="onClick">
    <TreeEx
      :class="treeClassName"
      ref="treeExRef"
      v-if="treeData.length"
      :draggable="isEdit"
      :multiple="isEdit"
      :checkable="isEdit"
      :checkStrictly="isEdit"
      v-model:selected-keys="selectedKeys"
      v-model:checked-keys="checkedKeys"
      v-model:expanded-keys="expandedKeys"
      @drop="onDrop"
      :last-selection-locked="!isEdit"
      :data="treeData"
      :filter="filter"
      :default-expand-all="!isEdit"
    >
      <template #title="{ node }">
        <EdhrOutlineToggleTreeNode
          :node="node"
          :isEdit="isEdit"
          :class="[ns.e('node')]"
          @click="onNodeClick(node, $event)"
          @new-outline="() => addOutline(node.key)"
          @new-doc="() => addDoc(node.key)"
        />
      </template>
    </TreeEx>
  </div>
</template>

<script lang="ts" setup name="edhr-outline-toggle-tree">
  import { useNamespace } from '@gct/runtime';
  import { TreeEx } from '/@/components/TreeEx';
  import {
    OutlineTreeNode,
    OutlineType,
  } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
  import { useEdhrOutlineToggleTree } from './logic';
  import EdhrOutlineToggleTreeNode from './edhr-outline-toggle-tree-node.vue';
  import { uuid2 } from '/@/utils/uuid';

  const ns = useNamespace('edhr-outline-toggle-tree');

  const props = withDefaults(
    defineProps<{
      isEdit: boolean;
      filter?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'select', value?: OutlineTreeNode): void;
  }>();

  const {
    checkedKeys,
    expandToggle,
    expandedKeys,
    newOutline,
    onDrop,
    remove,
    selectedKeys,
    treeData,
    treeExRef,
    addDoc,
    addOutline,
  } = useEdhrOutlineToggleTree(props, emit);

  const onNodeClick = (node: IData, event: MouseEvent) => {
    // 非编辑态的时候点击父节点，直接控制展开
    if (!props.isEdit && node.type === OutlineType.OUTLINE) {
      event.stopPropagation(); // 阻止冒泡，不触发选中事件
      treeExRef.value?.expandNode(node.key);
    }
  };

  // 编辑的时候点击空白区域，清空选中
  const treeClassName = 'tree-container-' + uuid2(16, 16);
  const onClick = (event: MouseEvent) => {
    const treeEl = document.querySelector(`.${treeClassName}`);
    if (props.isEdit && !treeEl?.contains(event.target as any)) {
      selectedKeys.value = [];
    }
  };

  // 暴露方法
  defineExpose({
    newOutline,
    remove,
    expandToggle,
    addOutline,
    addDoc,
  });
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-toggle-tree) {
    overflow: auto;
    :deep(.ant-tree) {
      color: #8f8f8f;

      // 悬浮选中样式
      .ant-tree-node-content-wrapper.ant-tree-node-selected {
        background-color: transparent;
      }
      .ant-tree-node-content-wrapper:hover {
        background-color: transparent;
      }
      .ant-tree-treenode {
        padding: 0 8px;
        height: 40px;
        border-radius: 4px;
        align-items: center;
        &:hover {
          background: #f2f7fd;
        }
      }
      .ant-tree-treenode.ant-tree-treenode-selected {
        background: #dfecfa;
      }

      .ant-tree-node-content-wrapper {
        padding: 0;
        width: 100px;
        &.ant-tree-node-selected {
          background-color: transparent;
          .#{bem(edhr-outline-toggle-tree,node-doc)} {
            color: var(--ant-primary-color);
          }
          .#{bem(edhr-outline-toggle-tree,node-outline)} {
            color: #474747;
          }
        }

        &:hover {
          .#{bem(edhr-outline-toggle-tree,node-outline)} {
            color: #474747;
          }
        }
      }

      // 箭头样式
      .ant-tree-switcher {
        align-self: center;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        margin-right: 8px;

        .ant-tree-switcher-icon {
          color: #8f8f8f;
          font-size: 16px;
        }
      }

      // 复选框样式
      .ant-tree-checkbox {
        margin: 0;
        margin-right: 8px;
      }
    }

    @include m(edit) {
      :deep(.ant-tree-treenode) {
        &::before {
          content: '\e810';
          font-family: 'iconfont' !important;
          font-size: 16px;
          font-style: normal;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      }
    }
  }
</style>
