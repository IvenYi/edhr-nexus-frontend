import { computed, ref, watch } from 'vue';
import {
  OutlineType,
  useEDHRWiki,
} from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
import { isNil, cloneDeep } from 'lodash-es';
import { OutlineConfigureTreeNode } from '../type';
import { recursiveIterate } from '/@/utils/recursive';
import { TreeExDropEvent, TreeExInstance } from '/@/components/TreeEx';
import { findOutlineNode } from '../edhr-outline.util';
import { message, Modal } from 'ant-design-vue';

export function useEdhrOutlineToggleTree(props, emit) {
  const { outlineTreeData, dragOutlineNode, refresh, deleteOutline, createDoc } = useEDHRWiki();

  const treeExRef = ref<TreeExInstance>();

  const treeData = ref<OutlineConfigureTreeNode[]>([]);
  /** 展开节点数据维护 */
  const expandedKeys = ref<string[]>([]);
  /** 复选框选中节点数据维护 */
  const checkedKeys = ref<string[]>([]);
  /** 点击单选选中节点数据维护 */
  const selectedKey = ref<string>();
  const selectedNode = computed(() => {
    return selectedKey.value
      ? findOutlineNode(outlineTreeData.value, selectedKey.value)?.node
      : undefined;
  });
  const selectedKeys = computed({
    get() {
      return selectedKey.value ? [selectedKey.value] : [];
    },
    set(v) {
      selectedKey.value = v?.length ? v[v.length - 1] : undefined;
    },
  });
  let hasEdit = false;

  const levelMap = ref<Record<string, string>>({});
  // 记录第一个出现的表单节点
  let firstFormNode: OutlineConfigureTreeNode | undefined;

  const calcTreeData = async () => {
    const _treeData = cloneDeep(outlineTreeData.value);
    levelMap.value = {};
    firstFormNode = undefined;

    // 处理目录的序号
    const parentMaxOutlineMap = new Map<string, number>();
    const getOutlineNumber = (parentKey: string = 'root'): number => {
      const currentNum = parentMaxOutlineMap.get(parentKey) || 0;
      parentMaxOutlineMap.set(parentKey, currentNum + 1);
      return currentNum + 1;
    };

    recursiveIterate<OutlineConfigureTreeNode>(_treeData, ({ item, parent }) => {
      // 处理序号
      if (item.type === 'OUTLINE') {
        const no = getOutlineNumber(parent?.key);
        const prefix = parent ? levelMap.value[parent.key] : '';
        levelMap.value[item.key] = `${prefix ? prefix + '-' : ''}${no}`;
        item.no = `${levelMap.value[item.key]}、`;
      } else {
        if (firstFormNode === undefined) {
          firstFormNode = item;
        }
      }
    });
    treeData.value = _treeData;

    // 树数据变更后如果有选中节点，且不存在的时候,抛空值出去
    if (selectedKey.value) {
      const node = findOutlineNode(outlineTreeData.value, selectedKey.value)?.node;
      if (!node) {
        selectedKey.value = undefined;
        emit('select', undefined);
      }
    } else {
      if (firstFormNode) {
        selectedKey.value = firstFormNode.key;
        emit('select', firstFormNode);
      }
    }
  };

  watch(
    () => selectedKey.value,
    (v, v2) => {
      if (v !== v2) {
        if (!v) {
          emit('select', undefined);
        } else {
          // 抛出选中节点数据
          const node = findOutlineNode(outlineTreeData.value, v)?.node;
          if (node) {
            emit('select', node);
          }
        }
      }
    },
  );

  watch(
    () => outlineTreeData.value,
    (v) => {
      if (!isNil(v)) {
        calcTreeData();
        hasEdit = false;
      }
    },
    { immediate: true },
  );

  // 默认第一次进来全展开
  watch(
    () => treeExRef.value,
    (v) => {
      if (v) {
        v.expandAll();
      }
    },
  );

  // 切换的时候如果没有选中表单，则抛出选中默认第一个表单
  watch(
    () => props.isEdit,
    (v) => {
      if (v === false) {
        if (selectedNode.value?.type !== OutlineType.DOC) {
          selectedKey.value = firstFormNode?.key;
          emit('select', firstFormNode);
        }
      }
    },
    { immediate: true },
  );

  /** 切换展开折叠 */
  function expandToggle() {
    if (expandedKeys.value.length > 0) {
      treeExRef.value!.collapseAll();
    } else {
      treeExRef.value!.expandAll();
    }
  }

  /** 指定目录下面新建子目录 */
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
      expandedKeys.value.push(parentId);
    }
  };

  /** 往选中的节点新建一个目录 */
  const newOutline = () => {
    addOutline(selectedKey.value);
  };

  /** 指定目录下面新建子目录 */
  const addDoc = async (parentId?: string) => {
    if (parentId) expandedKeys.value.push(parentId);
    await createDoc(parentId);
  };

  /** 删除复选框选中的节点数据 */
  const remove = async () => {
    if (!checkedKeys.value.length) {
      return;
    }
    // 删除父节点之后,子节点会自动被删除
    Modal.confirm({
      title: $t('sys.edhr.confirmToDelete'),
      okText: $t('sys.okText'),
      cancelText: $t('sys.cancelText'),
      closable: false,
      onOk: async () => {
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
      },
      onCancel: () => {},
    });
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

    // 拖拽会后默认展开父节点
    if (after.parent?.key && !expandedKeys.value.includes(after.parent.key)) {
      expandedKeys.value.push(after.parent.key);
    }

    await dragOutlineNode({
      dragKey: dragNode.key,
      parentKey: after.parent?.key,
      sortNum: targetSortNum,
    });
    await refresh();
  };

  return {
    levelMap,
    treeExRef,
    treeData,
    selectedKeys,
    checkedKeys,
    expandedKeys,
    expandToggle,
    newOutline,
    remove,
    onDrop,
    addOutline,
    addDoc,
  };
}
