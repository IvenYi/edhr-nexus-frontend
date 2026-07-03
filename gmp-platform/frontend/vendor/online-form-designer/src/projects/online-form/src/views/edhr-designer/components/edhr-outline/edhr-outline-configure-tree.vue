<template>
  <div :class="[ns.b()]">
    <TreeEx
      v-if="treeData.length"
      ref="treeExRef"
      :draggable="true"
      :multiple="true"
      :checkable="true"
      :checkStrictly="true"
      :selected-keys="selectedKeys"
      v-model:checked-keys="checkedKeys"
      :expanded-keys="selfExpandedKeys"
      @update:expanded-keys="onExpandedKeysChange"
      @update:selected-keys="onSelectedKeysChange"
      :data="treeData"
      @drop="onDrop"
    >
      <template #title="{ node }">
        <EdhrOutlineConfigureTreeNode
          :node="node as OutlineConfigureTreeNode"
          :show-field="showField"
          @new-outline="() => addOutline(node.key)"
        />
      </template>
    </TreeEx>
  </div>
</template>

<script lang="ts" setup name="edhr-outline-configure-tree">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { cloneDeep, isNil } from 'lodash-es';
  import EdhrOutlineConfigureTreeNode from './edhr-outline-configure-tree-node.vue';
  import { findOutlineNode } from './edhr-outline.util';
  import { TreeExDropEvent, TreeEx, TreeExInstance } from '/@/components/TreeEx';
  import { OutlineConfigureTreeNode } from './type';
  import {
    OutlineType,
    useEDHRWiki,
  } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
  import { message } from 'ant-design-vue';
  import { recursiveIterate } from '/@/utils/recursive';

  const { t } = useI18n();

  const ns = useNamespace('edhr-outline-configure-tree');
  const { outlineTreeData, dragOutlineNode, refresh, deleteOutline } = useEDHRWiki();

  const treeExRef = ref<TreeExInstance>();

  // 当前选中的节点集合
  const selectedNodeKey = ref<string>();
  const selectedKeys = computed(() => {
    return selectedNodeKey.value ? [selectedNodeKey.value] : [];
  });
  const checkedKeys = ref<string[]>([]);

  const treeData = ref<OutlineConfigureTreeNode[]>([]);

  const props = withDefaults(
    defineProps<{
      showField: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'expand-status', status: 'all-expanded' | 'all-collapsed' | 'normal'): void;
  }>();

  let hasEdit = false;
  /** 有子节点的节点个数 */
  const parentNodeCount = ref(0);

  const onSelectedKeysChange = (v: string[]) => {
    // 选中只能单选,取最新的选中节点标识
    const currentKey = v.length ? v[v.length - 1] : undefined;
    // if (currentKey) {
    // const { node } = findOutlineNode(treeData.value, currentKey)!;
    // if (node.type === 'DOC') {
    //   // 不能选中表单
    //   return;
    // }
    // }
    selectedNodeKey.value = currentKey;
  };

  // 选中节点数据维护
  const selfExpandedKeys = ref<string[]>([]);

  const addOutline = (parentId?: string) => {
    if (hasEdit) {
      return;
    }
    const newNodeData = {
      title: '',
      type: 'OUTLINE',
      parentId: parentId,
      isEdit: true,
    };
    if (!parentId) {
      treeData.value.push(newNodeData as any);
    } else {
      const parentNode = findOutlineNode(treeData.value, parentId)!.node;
      if (parentNode.type === OutlineType.DOC) {
        message.error($t('sys.onlineForm.cannotAddDirectoryUnderDocument'));
        return;
      }
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(newNodeData as any);
    }

    // 添加后逻辑
    hasEdit = true;
    if (parentId) {
      selfExpandedKeys.value.push(parentId);
    }
  };

  const newOutline = () => {
    addOutline(selectedNodeKey.value);
  };

  /**
   * 拖拽事件处理
   * @param dragNode
   * @param after
   */
  const onDrop = async ({ dragNode, after }: TreeExDropEvent) => {
    if (after.parent && (after.parent as OutlineConfigureTreeNode).type === OutlineType.DOC) {
      message.error($t('sys.onlineForm.cannotDragUnderForm'));
      return;
    }

    const arr = (
      after.parent ? after.parent.children : treeData.value
    ) as OutlineConfigureTreeNode[];
    let targetSortNum = 0;
    if (!arr?.length) {
      // 目标元素没有子元素时,sortNum给1
      targetSortNum = 1;
    } else if (after.index === arr.length) {
      // 排列在所有元素之后,sortNum为最后一个元素的sortNum+1
      targetSortNum = arr[after.index - 1].sortNum + 1;
    } else {
      // 排列在目标元素之前,sortNum为目标元素的sortNum
      targetSortNum = arr[after.index].sortNum;
    }
    await dragOutlineNode({
      dragKey: dragNode.key,
      parentKey: after.parent?.key,
      sortNum: targetSortNum,
    });
    await refresh();
  };

  const remove = async () => {
    if (!checkedKeys.value.length) {
      return;
    }
    // 删除父节点之后,子节点会自动被删除
    await Promise.all(
      checkedKeys.value.map((id) => {
        const find = findOutlineNode(treeData.value, id);
        if (!find) {
          console.log('[ checkedKeys ] >', checkedKeys.value, treeData.value, id);
          return;
        }

        return deleteOutline(find.node);
      }),
    );
    // 刷新
    refresh();
  };
  const collapseAll = () => {
    selectedNodeKey.value = undefined;
    checkedKeys.value = [];
    treeExRef.value!.collapseAll();
  };
  const expandAll = () => {
    selectedNodeKey.value = undefined;
    checkedKeys.value = [];
    treeExRef.value!.expandAll();
  };

  const onExpandedKeysChange = (v?: string[]) => {
    selfExpandedKeys.value = v || [];
    let status: any = 'normal';
    if (!v?.length) {
      status = 'all-collapse';
    } else if (parentNodeCount.value === v.length) {
      status = 'all-expanded';
    }
    emit('expand-status', status);
  };

  watch(
    () => outlineTreeData.value,
    (v) => {
      if (!isNil(v)) {
        const _treeData = cloneDeep(outlineTreeData.value);
        treeData.value = _treeData;
        parentNodeCount.value = 0;
        selfExpandedKeys.value = [];
        recursiveIterate<OutlineConfigureTreeNode>(_treeData, ({ item }) => {
          if (item.children?.length) {
            parentNodeCount.value++;
            selfExpandedKeys.value.push(item.key);
          }
        });
        hasEdit = false;
        emit('expand-status', 'all-expanded');
      }
    },
    { immediate: true },
  );

  // 暴露方法
  defineExpose({
    newOutline,
    remove,
    collapseAll,
    expandAll,
  });
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-configure-tree) {
    height: 100%;
    overflow: auto;
    :deep(.ant-tree) {
      height: 100%;
      .ant-tree-node-content-wrapper.ant-tree-node-selected {
        background-color: transparent;
      }
      .ant-tree-node-content-wrapper:hover {
        background-color: transparent;
      }
      .ant-tree-treenode {
        padding: 4px 0;
        border: 1px solid transparent;
        &:hover {
          background-color: #f5f5f5;
        }
      }
      .ant-tree-treenode.ant-tree-treenode-selected {
        background-color: #f5f5f5;
        border-color: #6ab5fb;
      }
      .ant-tree-node-content-wrapper {
        width: 100px;
      }
    }
    // 控制节点的菜单选中显隐
    // .#{bem(edhr-outline-configure-tree-node,actions)} {
    //   display: none;
    // }
    // .#{bem(edhr-outline-configure-tree-node,field)} {
    //   display: inline-flex;
    // }

    // .ant-tree-node-selected {
    //   .#{bem(edhr-outline-configure-tree-node,actions)} {
    //     display: block;
    //   }
    //   .#{bem(edhr-outline-configure-tree-node,field)} {
    //     display: none;
    //   }
    // }
  }
</style>
