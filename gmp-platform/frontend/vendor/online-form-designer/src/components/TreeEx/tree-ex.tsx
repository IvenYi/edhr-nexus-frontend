import { computed, defineComponent, nextTick, PropType, ref, renderSlot, watch, onMounted } from 'vue';
import { useNamespace } from '@gct/runtime';
import { Tree } from 'ant-design-vue';
import { cloneDeep, isNil } from 'lodash-es';
import { findNodeInfoByKey, transferToDropInfo, TreeExEmits, TreeSlots } from './tree-ex.util';
import { ITreeNode } from './type';
import './tree-ex.scss';
import { filterTreeData, recursiveIterate } from '/@/utils/recursive';
import { EventDataNode } from 'ant-design-vue/es/tree';
import { CheckInfo } from 'ant-design-vue/es/vc-tree/props';

export const TreeEx = defineComponent({
  name: 'TreeEx',
  props: {
    draggable: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object as PropType<Array<ITreeNode>>,
      required: true,
    },
    filter: {
      type: String,
      default: undefined,
    },
    selectedKeys: {
      type: Array<string>,
      default: undefined,
    },
    checkedKeys: {
      type: Array<string>,
      default: undefined,
    },
    expandedKeys: {
      type: Array<string>,
      default: undefined,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    /** 最后一个选中的数据不能取消选中 */
    lastSelectionLocked: {
      type: Boolean,
      default: false,
    },
    /** 节点前出复选框 */
    checkable: {
      type: Boolean,
      default: false,
    },
    /** 节点复选框父子节点不关联 */
    checkStrictly: {
      type: Boolean,
      default: false,
    },
    // ! 拦截ant的这个选项,开启这个之后,子节点有展开项时,父节点无法关闭
    autoExpandParent: {
      type: Boolean,
      default: true,
    },
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    // 是否展示节点连接线
    showLine: {
      type: Boolean,
      default: false,
    },
    ignoreCase: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: undefined,
    },
    animationKey: {
      type: String,
      default: undefined,
    }
  },
  emits: TreeExEmits,
  slots: TreeSlots,
  setup(props, { emit }) {
    const ns = useNamespace('tree-ex');
    // console.log('[ props ] treeex setup >');

    const treeRef = ref<InstanceType<typeof Tree>>();
    // 选中节点数据维护
    const selfExpandedKeys = ref<string[]>();
    const expandedKeysValue = computed({
      get() {
        return isNil(props.expandedKeys) ? selfExpandedKeys.value : props.expandedKeys;
      },
      set(v) {
        selfExpandedKeys.value = v || [];
        emit('update:expandedKeys', v || []);
      },
    });

    // 选中节点数据维护
    const selfSelectedKeys = ref<string[]>([]);
    const selectedKeysValue = computed({
      get() {
        return isNil(props.selectedKeys) ? selfSelectedKeys.value : props.selectedKeys;
      },
      set(v) {
        selfSelectedKeys.value = v;
        emit('update:selectedKeys', v);
      },
    });

    const handleSelect = (sKeys, { node }) => {
      // 不可取消选中
      if (props.lastSelectionLocked && sKeys.length === 0) return;

      // 不可选中的数据不能选中
      if (node.dataRef.selectable === false) return;

      if (props.multiple) {
        // 多选的情况
        selectedKeysValue.value = [...sKeys];
      } else {
        // 单选
        if (sKeys.length === 0) {
          selectedKeysValue.value = [];
        } else {
          selectedKeysValue.value = [node.dataRef.key];
        }
      }
    };

    // 选中复选框节点数据维护
    const selfCheckedKeys = ref<string[]>([]);
    const checkedKeysValue = computed({
      get() {
        return isNil(props.checkedKeys) ? selfCheckedKeys.value : props.checkedKeys;
      },
      set(v) {
        selfCheckedKeys.value = v;
        emit('update:checkedKeys', v);
      },
    });

    const handleCheck = (
      checked:
        | string[]
        | {
            checked: string[];
            halfChecked: string[];
          },
      info: CheckInfo,
    ) => {
      const checkedKeys = Array.isArray(checked) ? checked : checked.checked;
      const { node } = info;
      // 不可取消选中
      if (props.lastSelectionLocked && checkedKeys.length === 0) return;

      // 不可选中的数据不能选中
      if (node.dataRef!.checkable === false) return;

      if (props.multiple) {
        // 多选的情况
        checkedKeysValue.value = [...checkedKeys];
      } else {
        // 单选
        checkedKeysValue.value = [node.dataRef!.key as string];
      }
    };

    // 拖拽
    const actualDraggable = computed(() => {
      return props.draggable && !props.filter;
    });

    const handleDrop = async (info) => {
      emit('drop', transferToDropInfo(info, props.data));
      console.log('[ info ] >', info);
      console.log('[ newEvent ] >', transferToDropInfo(info, props.data));
    };

    const collapseAll = () => {
      console.log('[ collapseAll ] >');
      expandedKeysValue.value = [];
    };
    const expandAll = () => {
      console.log('[ expandAll ] >');
      const newExpandKeys: string[] = [];
      recursiveIterate<ITreeNode>(props.data, ({ item }) => {
        if (item.children?.length) {
          newExpandKeys.push(item.key);
        }
      });
      expandedKeysValue.value = newExpandKeys;
    };

    const expandNode = (key: string, isExpand?: boolean) => {
      const newKeys = [...(expandedKeysValue.value || [])];
      const currentExpanded = newKeys.includes(key);
      const toExpanded = isNil(isExpand) ? !currentExpanded : isExpand;
      if (currentExpanded === toExpanded) {
        return;
      }
      console.log('[ expandNode ] >', key, toExpanded);
      if (toExpanded) {
        newKeys.push(key);
      } else {
        newKeys.splice(newKeys.indexOf(key), 1);
      }
      expandedKeysValue.value = newKeys;
    };

    const onExpand = (eKeys, { expanded, node }) => {
      const newKeys = [...eKeys];
      expandedKeysValue.value = newKeys;
    };

    watch(
      () => props.data,
      (newData) => {
        if (props.defaultExpandAll) {
          expandAll();
        }
      },
      { immediate: true },
    );

    watch(() => props.animationKey, (key) => {
      if (key) {
        // 等待 DOM 更新后再执行动画
        nextTick(() => {
          treeRef.value?.scrollTo({ key });
          setTimeout(() => {
            doBgcoAnimation(key);
          }, 1000);
        });
      }
    });

    function doBgcoAnimation(key: string) {
      const child = document.querySelector(`.node-key-${key}`) as HTMLElement;
      if (!child) {
        return;
      }
      const nodeDiv = child.closest('.ant-tree-treenode');
      if (!nodeDiv) return;
      // 移除可能存在的旧动画类
      nodeDiv.classList.remove('bgco-animation');
      
      // 强制重排，确保可以重新触发动画
      void nodeDiv.offsetWidth;
      
      // 添加动画类
      nodeDiv.classList.add('bgco-animation');
      
      // 600ms 后移除动画类（与 CSS 动画时长保持一致）
      setTimeout(() => {
        nodeDiv.classList.remove('bgco-animation');
      }, 600);
    }

    const filteredTreeData = computed(() => {
      if (props.filter) {
        const cloneData = cloneDeep(props.data);
        const filterData = filterTreeData(cloneData, (item) => {
          console.log(
            'item.title.includes(props.filter!)',
            item.title,
            item.title.includes(props.filter!),
          );

          if (props.ignoreCase) {
            return item.title.toLowerCase().includes(props.filter?.toLowerCase());
          } else {
            return item.title.includes(props.filter!);
          }
        });
        if (filterData.length > 0) {
          nextTick(() => {
            // 展开所有
            expandAll();
          });
        }
        return filterData;
      } else {
        return props.data;
      }
    });

    const scrollTo = (params: { key: string | number; align?: 'top' | 'bottom' | 'auto'; offset?: number }) => {
      treeRef.value?.scrollTo(params);
    }

    return {
      ns,
      selectedKeysValue,
      checkedKeysValue,
      expandedKeysValue,
      actualDraggable,
      filteredTreeData,
      handleSelect,
      handleCheck,
      handleDrop,
      collapseAll,
      expandAll,
      onExpand,
      expandNode,
      treeRef,
      scrollTo,
    };
  },
  render() {
    const treeSlots: any = {};
    const slotsKeys = Object.keys(this.$slots);
    if (slotsKeys.includes('title')) {
      treeSlots.title = (item: EventDataNode) => {
        const { node } = findNodeInfoByKey(this.data, item.dataRef!.key as string)!;
        return renderSlot(this.$slots, 'title', { node });
      };
    }

    return (
      <Tree
        ref="treeRef"
        class={[this.ns.b(), this.showLine && 'show-tree-line']}
        selectedKeys={this.selectedKeysValue}
        checkedKeys={this.checkedKeysValue}
        expandedKeys={this.expandedKeysValue}
        onExpand={this.onExpand}
        block-node
        checkable={this.checkable}
        checkStrictly={this.checkStrictly}
        multiple={this.multiple}
        draggable={this.actualDraggable}
        tree-data={this.filteredTreeData}
        onDrop={this.handleDrop}
        onSelect={this.handleSelect}
        onCheck={this.handleCheck as any}
        height={this.height || undefined}
      >
        {{ ...treeSlots }}
      </Tree>
    );
  },
});
