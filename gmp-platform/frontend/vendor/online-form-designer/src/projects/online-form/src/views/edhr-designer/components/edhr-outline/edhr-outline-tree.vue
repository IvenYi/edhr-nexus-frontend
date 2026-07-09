<template>
  <div :class="[ns.b()]">
    <TreeEx
      ref="treeExRef"
      v-if="treeData.length"
      default-expand-all
      v-model:selected-keys="selectedKeys"
      :last-selection-locked="true"
      :data="treeData"
      :key="refreshKey"
    >
      <template #title="{ node }">
        <span :class="ns.e(`node-${node.type.toLowerCase()}`)" @click="expandTrigger(node.key)">
          <i v-if="node.type === OutlineType.DOC" :class="['icon-dot', ns.e('type-icon')]"></i>
          <span :class="[ns.e('node-label')]" :title="node.title">
            {{ `${levelMap[node.key] ? levelMap[node.key] + '、' : ''}${node.title}` }}
          </span>
        </span>
      </template>
    </TreeEx>
  </div>
</template>

<script lang="ts" setup name="EdhrOutline">
  import { computed, ref, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { cloneDeep, isNil } from 'lodash-es';
  import { TreeEx, TreeExInstance } from '/@/components/TreeEx';
  import { recursiveIterate } from '/@/utils/recursive';
  import {
    OutlineTreeNode,
    OutlineType,
    useEDHRWiki,
  } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
  import { findOutlineNode } from './edhr-outline.util';

  const ns = useNamespace('edhr-outline-tree');

  const treeExRef = ref<TreeExInstance>();
  const { outlineTreeData, edhrId } = useEDHRWiki();
  const refreshKey = ref('');

  const props = withDefaults(
    defineProps<{
      selectedNodeId?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:selectedNodeId', value?: string): void;
    (e: 'select', value?: OutlineTreeNode): void;
  }>();

  // 当前选中的单据
  const selectedKeys = computed({
    get() {
      return props.selectedNodeId ? [props.selectedNodeId] : [];
    },
    set(v) {
      emit('update:selectedNodeId', v[0]);

      // 抛出选中数据
      const node = findOutlineNode(outlineTreeData.value, v[0])?.node;
      if (node) {
        emit('select', node);
      }
    },
  });

  const treeData = ref<OutlineTreeNode[]>([]);
  const levelMap = ref<Record<string, string>>({});
  const calcTreeData = async () => {
    const _treeData = cloneDeep(outlineTreeData.value);
    levelMap.value = {};

    // 处理目录的序号
    let parentMaxOutlineMap = new Map<string, number>();
    const getOutlineNumber = (parentKey: string = 'root'): number => {
      const currentNum = parentMaxOutlineMap.get(parentKey) || 0;
      parentMaxOutlineMap.set(parentKey, currentNum + 1);
      return currentNum + 1;
    };

    // 记录第一个出现的表单的key
    let firstFormNode: OutlineTreeNode | undefined;

    recursiveIterate<OutlineTreeNode>(_treeData, ({ item, parent }) => {
      // 处理序号
      if (item.type === 'OUTLINE') {
        const no = getOutlineNumber(parent?.key);
        const prefix = parent ? levelMap.value[parent.key] : '';
        levelMap.value[item.key] = `${prefix ? prefix + '-' : ''}${no}`;
      } else {
        if (firstFormNode === undefined) {
          firstFormNode = item;
        }
      }
      // 设置目录节点不可选
      item.selectable = item.type !== 'OUTLINE';
    });
    treeData.value = _treeData;
    refreshKey.value = edhrId.value!;

    // 树数据变更后如果有选中节点，且不存在的时候,抛空值出去
    if (selectedKeys.value[0]) {
      const node = findOutlineNode(outlineTreeData.value, selectedKeys.value[0])?.node;
      if (!node) {
        emit('update:selectedNodeId', undefined);
        emit('select', undefined);
      }
    } else {
      if (firstFormNode) {
        emit('update:selectedNodeId', firstFormNode.key);
        emit('select', firstFormNode);
      }
    }
  };

  watch(
    () => outlineTreeData.value,
    (v) => {
      if (!isNil(v)) {
        calcTreeData();
      }
    },
    { immediate: true },
  );

  const expandTrigger = (key: string) => {
    treeExRef.value?.expandNode(key);
  };
</script>

<style lang="less" scoped>
  .gct-edhr-outline-tree {
    :deep(.ant-tree-node-content-wrapper) {
      &:hover {
        background-color: hsl(from var(--ant-primary-color) h s 98%);
      }
    }
  }
</style>

<style lang="scss" scoped>
  @include b(edhr-outline-tree) {
    overflow: auto;
    :deep(.ant-tree) {
      color: #8f8f8f;

      .ant-tree-node-content-wrapper {
        text-wrap: nowrap;
        // 出省略号
        // width: 100px;
        // text-overflow: ellipsis;
        // overflow: hidden;
        &.ant-tree-node-selected {
          background-color: transparent;
          color: var(--ant-primary-color);
          .#{bem(edhr-outline-tree,node-doc)} {
            color: var(--ant-primary-color);
          }
        }

        &:hover {
          .#{bem(edhr-outline-tree,node-outline)} {
            color: #474747;
          }
        }
      }
      .ant-tree-title {
        min-width: 100%;
        display: inline-block;
      }

      .ant-tree-switcher {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 24px;
        padding-right: 4px;
        line-height: 24px;

        .ant-tree-switcher-icon {
          color: #8f8f8f;
          font-size: 16px;
        }
      }
    }

    @include e(node-outline) {
      min-width: 100%;
      display: inline-block;
      font-weight: 400;
    }
    @include e(node-doc) {
      min-width: 100%;
      display: inline-block;
      color: #242424;
      > * {
        vertical-align: middle;
      }
    }
    .icon-dot {
      display: inline-block;
      width: 20px;
      height: 20px;
      padding: 8px;
      &::after {
        display: block;
        content: '';
        width: 4px;
        height: 4px;
        background: var(--ant-primary-color);
        border-radius: 50%;
      }
    }
  }
</style>
