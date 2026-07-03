import { PropType, SlotsType, defineComponent, renderSlot } from 'vue';
import './pure-tree.less';
import { IPureTreeNode } from './types';
import NodeArrow from './components/node-arrow.vue';
import NodeTitle from './components/node-title.vue';

export const PureTree = defineComponent({
  name: 'PureTree',
  props: {
    nodes: {
      type: Array as PropType<IPureTreeNode[]>,
      default: () => [],
    },
  },
  emits: {
    nodeClick: (_node: IPureTreeNode) => true,
    nodeArrowClick: (_node: IPureTreeNode) => true,
  },
  slots: Object as SlotsType<{
    node: { node: IPureTreeNode };
    nodeArrow: { node: IPureTreeNode };
  }>,
  setup(props, { emit, slots }) {
    const onNodeClick = (node: IPureTreeNode, e: MouseEvent) => {
      e.stopPropagation();
      emit('nodeClick', node);
    };

    const nodeArrowClick = (node: IPureTreeNode, e: MouseEvent) => {
      e.stopPropagation();
      emit('nodeArrowClick', node);
    };

    const renderIndent = (level: number) => {
      return <span class="pure-tree__indent" style={{ '--pure-tree__node-level': level }} />;
    };

    const renderArrow = (node: IPureTreeNode) => {
      /** 是否是父节点 */
      const isParent = node.children && node.children.length > 0;
      if (!isParent) {
        /** 绘制子节点没有箭头时的缩进 */
        return <div class="pure-tree__node-arrow-indent"></div>;
      }
      const isExpand = !!node.expanded;
      const arrow = renderSlot(slots, 'nodeArrow', { node }, () => {
        return [<NodeArrow expanded={isExpand} />];
      });
      return (
        <div class="pure-tree__node-arrow" onClick={(e) => nodeArrowClick(node, e)}>
          {arrow}
        </div>
      );
    };

    const renderNode = (node: IPureTreeNode) => {
      const label = renderSlot(slots, 'node-label', { node }, () => [
        <NodeTitle title={node.name} tooltip={node.name} />,
      ]);
      const nodeVNode = renderSlot(slots, 'node', { node }, () => [label]);
      return <div class="pure-tree__node">{nodeVNode}</div>;
    };

    const renderNodeWrapper = (node: IPureTreeNode, level: number = 0) => {
      /** 是否是父节点 */
      const isParent = node.children && node.children.length > 0;
      const classNames = {
        'pure-tree__node-wrapper': true,
        'pure-tree__node-wrapper--parent': isParent,
        'pure-tree__node-wrapper--expanded': isParent && node.expanded,
        'pure-tree__node-wrapper--selected': node.selected,
        [`pure-tree__node-wrapper-level-${level}`]: true,
      };

      return (
        <div class={classNames}>
          <div class="pure-tree__node-wrapper-content" onClick={(e) => onNodeClick(node, e)}>
            {renderIndent(level)}
            {renderArrow(node)}
            {renderNode(node)}
          </div>
          {node.children && node.children.length > 0 && (
            <div class="pure-tree__node-wrapper-children">
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
      <div class={['pure-tree']}>{this.nodes.map((node) => this.renderNodeWrapper(node))}</div>
    );
  },
});

export default PureTree;
