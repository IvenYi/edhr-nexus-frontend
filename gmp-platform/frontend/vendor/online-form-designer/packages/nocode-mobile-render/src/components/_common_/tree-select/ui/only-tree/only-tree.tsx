import {
  PropType,
  SlotsType,
  computed,
  defineComponent,
  ref,
  renderSlot,
  watch,
  watchEffect,
} from 'vue';
import { TreeNode } from '../../types/only-tree';
import './only-tree.less';
import { Checkbox, Icon } from 'vant';

export const OnlyTree = defineComponent({
  name: 'OnlyTree',
  props: {
    nodes: {
      type: Object as PropType<TreeNode[]>,
      default: () => [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    selectedIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: {
    'update:selectedIds': (_value: string[]) => true,
    nodeCheckChange: (_checked: boolean, _node: TreeNode) => true,
  },
  slots: Object as SlotsType<{
    bottom: {};
    nodeLabel: { node: TreeNode };
  }>,
  setup(props, { emit, slots }) {
    const expandedIds = ref<string[]>([]);
    const selectedIds = ref<string[]>([]);

    watchEffect(() => {
      selectedIds.value = props.selectedIds ?? [];
    });

    const onNodeChecked = (node: TreeNode) => {
      if (node.disabled) {
        return;
      }
      /** 是否选中 */
      const checked = !selectedIds.value.includes(node.id);
      const { multiple } = props;
      const newSelectedIds = multiple
        ? checked
          ? [...selectedIds.value, node.id]
          : selectedIds.value.filter((id) => id !== node.id)
        : checked
          ? [node.id]
          : [];
      selectedIds.value = newSelectedIds;
      emit('update:selectedIds', selectedIds.value);
      emit('nodeCheckChange', checked, node);
    };

    const renderCheckbox = (node: TreeNode) => {
      return (
        <Checkbox
          class="only-tree__checkbox"
          shape="square"
          checked={selectedIds.value.includes(node.id)}
        />
      );
    };

    const renderArrow = (node: TreeNode) => {
      const isExpand = expandedIds.value.includes(node.id);
      return (
        <div
          class="only-tree__expand-arrow"
          onClick={(e) => {
            e.stopPropagation();
            if (isExpand) {
              expandedIds.value = expandedIds.value.filter((id) => id !== node.id);
            } else {
              expandedIds.value.push(node.id);
            }
          }}
        >
          <Icon name={isExpand ? 'arrow-up' : 'arrow-down'} />
        </div>
      );
    };

    const renderIndentation = (level: number) => {
      // 层级缩进
      const indentWidth = level * 20;
      return <div class="only-tree__indentation" style={{ width: `${indentWidth}px` }}></div>;
    };

    const renderNode = (node: TreeNode) => {
      const label = renderSlot(slots, 'node-label', { node }, () => [node.name]);
      return <div class="only-tree__node">{label}</div>;
    };

    const renderNodeWrapper = (node: TreeNode, level: number = 0) => {
      const isParent = node.children && node.children.length > 0;
      const classNames = ['only-tree__wrapper'];
      if (isParent) {
        classNames.push('only-tree__wrapper--has-children');
      }
      if (expandedIds.value.includes(node.id)) {
        classNames.push('only-tree__wrapper--expanded');
      }
      if (selectedIds.value.includes(node.id)) {
        classNames.push('only-tree__wrapper--checked');
      }
      if (node.disabled) {
        classNames.push('only-tree__wrapper--disabled');
      }

      return (
        <div class={classNames}>
          <div
            class="only-tree__wrapper-node"
            onClick={() => {
              onNodeChecked(node);
            }}
          >
            {isParent && renderArrow(node)}
            {renderIndentation(level)}
            {renderCheckbox(node)}
            {renderNode(node)}
          </div>
          {node.children && node.children.length > 0 && (
            <div class="only-tree__wrapper-children">
              {node.children.map((child) => renderNodeWrapper(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return { renderNodeWrapper };
  },
  render() {
    return (
      <div class={['only-tree', this.multiple ? 'only-tree--multiple' : 'only-tree--single']}>
        {this.nodes.map((node) => this.renderNodeWrapper(node))}
        {this.$slots.bottom && (
          <div class="only-tree__wrapper-bottom">{this.$slots.bottom({})}</div>
        )}
      </div>
    );
  },
});

export default OnlyTree;
