import { ref, reactive, computed, watch, toRef } from 'vue';
import { isGroupNode, generateData, findNode, traverse, traverseFilter } from '../utils/tree-tool';
import type {
  ColumnItem,
  FieldItem,
  TreeNodeGroup,
  TreeNode,
  ColumnsChange,
} from '../types/index.d';

const MAX_ENABLE_COUNT = 5000000;

export const useTreeData = (
  useMultiLevelTHead: boolean,
  isResetData?: boolean,
  draggable?: boolean,
  maxEnableCount?: number,
  onColumnsChange?: ColumnsChange,
) => {
  const rnd = ref<number>(0);
  const leafKeys = ref<Array<string>>([]);
  const refOriginalLeafKeys = ref<Array<string>>([]);
  const refTotalFields = ref<number>(0);
  const multiple = computed(() => useMultiLevelTHead);

  const root = reactive<TreeNodeGroup>({
    key: '0',
    title: 'root',
    children: [],
    level: 0,
    type: 'group',
    parent: null as any,
  });

  const onChangeTree = (columnsData: ColumnItem[], fields: FieldItem[]) => {
    const keys: string[] = [];

    function handle(items: ColumnItem[], parent: TreeNodeGroup): TreeNode[] {
      return items.map(({ id, ...restItem }) => {
        const node: any = {
          ...restItem,
          key: id,
          parent,
          level: parent.level + 1,
          isLeaf: restItem.type === 'field',
        };
        if (!node.isLeaf) {
          node.children = handle(node.children as any, node);
        } else {
          const fieldItem = fields.find((item) => item.id === id)!;
          if (fieldItem) {
            node.disabled = fieldItem.disabled;
            if (fieldItem) {
              node.disableCheckbox = fieldItem.disabled;
              node.fieldType = fieldItem.type;
              keys.push(id);
              refTotalFields.value += 1;
            }
          }
        }
        return node;
      });
    }

    root.children = handle(columnsData, root);
    leafKeys.value = keys;
    if (!isResetData) {
      refOriginalLeafKeys.value = [...keys];
    }
  };

  watch(
    multiple,
    (val) => {
      if (!val) {
        const result: TreeNode[] = [];
        traverse((node) => {
          if (!isGroupNode(node)) {
            result.push({
              ...node,
              parent: root,
            });
          }
        }, root.children);
        root.children = result;
      }
    },
    {
      immediate: true,
    },
  );

  const data = computed(() => root.children);

  const refresh = () => {
    root.children = [...root.children];
    // rnd.value += 1;
  };

  const handleColumnsChange = () => {
    onColumnsChange?.(generateData(root.children));
  };

  const remainCount = computed(() => (maxEnableCount ?? MAX_ENABLE_COUNT) - leafKeys.value.length);

  function getContainerNode(node?: TreeNode) {
    // let parent = root
    // if (!node && selectedKeys[0]) {
    //   let node = findNode(selectedKeys[0], root)!
    //   if (isGroupNode(node)) {
    //     parent = node
    //   } else {
    //     parent = node.parent
    //   }
    // }
    // return parent
    return root;
  }

  return {
    data,
    root,
    leafKeys,
    multiple,
    draggable,
    remainCount: remainCount,
    addTreeNodes(nodes: Omit<TreeNode, 'parent'>[], parent: TreeNodeGroup) {
      const p = findNode(parent.key, root) as TreeNodeGroup;
      const newNodes = nodes.map(
        (item) =>
          ({
            ...item,
            level: p.level + 1,
            parent: p,
          }) as TreeNode,
      );
      p.children.push(...newNodes);
      const newLeafKeys = [...leafKeys.value];
      nodes.forEach((item) => {
        if (item.isLeaf) {
          newLeafKeys.push(item.key);
        }
      });
      leafKeys.value = newLeafKeys;
      refresh();
      setTimeout(() => {
        newNodes.forEach((node) => {
          if (node.isNew) {
            node.isNew = false;
          }
        });
      }, 500);
      handleColumnsChange();
    },
    removeTreeNodesByKeys(keys: string[]) {
      root.children = traverseFilter((node) => !keys.includes(node.key), root.children);

      leafKeys.value = leafKeys.value.filter((key) => !keys.includes(key));
      handleColumnsChange();
    },
    moveTreeNode(source: TreeNode, target: TreeNode, direction: number, asChildren = false) {
      const sourceParent = findNode(source.parent.key, root) as TreeNodeGroup;
      let j = 0;
      let targetParent = findNode(target.parent.key, root) as TreeNodeGroup;
      if (asChildren) {
        if (isGroupNode(target)) {
          targetParent = findNode(target.key, root) as TreeNodeGroup;
        } else {
          j = targetParent.children.findIndex((item) => item.key === target.key);
          j += 1;
        }
      } else {
        j = targetParent.children.findIndex((item) => item.key === target.key);
        j += direction === 1 ? 1 : -1;
        j = Math.max(j, 0);
      }
      if (targetParent.level >= 3 && isGroupNode(source)) {
        return;
      }
      const i = sourceParent.children.findIndex((item) => item.key === source.key);
      sourceParent.children.splice(i, 1);
      if (source.parent === targetParent) {
        targetParent.children.splice(i < j ? j - 1 : j, 0, source);
      } else {
        source.parent = targetParent;
        source.level = targetParent.level + 1;
        targetParent.children.splice(j, 0, source);
      }
      refresh();
      handleColumnsChange();
    },
    getContainerNode,
    onChangeTree,
  };
};

export type TreeProps = ReturnType<typeof useTreeData>;
