import {
  defineComponent,
  resolveComponent,
  h,
  onMounted,
  ref,
  watch,
  onBeforeUnmount,
  computed,
  nextTick,
  VNode,
} from 'vue';
import { useNamespace } from '@gct/runtime';
import { calcStyle, IDesignNode } from '@gct/base';
import { IDesignViewOptions, INodeProvider } from '@gct/runtime-design';
import { DesignItemAttribute, DesignNodeMode, DesignNodeType } from '../../../constant';
import { NodeRegister } from '../../../register';
import { useDesignViewController } from '../../../hooks';
import {
  DesignItemHighlighter,
  DesignItemHighlighterBinding,
} from '../design-item-highlighter/design-item-highlighter';
import { MobileContainer } from '../../mobile-container/mobile-container';
import { DesignDragItem } from '../design-drag-item/design-drag-item';
import { DesignDropLine } from '../design-drop-line/design-drop-line';
import { DesignNotDragItem } from '../design-not-drag-item/design-not-drag-item';
import './design-content.scss';

export const DesignContent = defineComponent({
  name: 'DesignContent',
  components: {
    DesignItemHighlighter,
  },
  props: {
    opts: {
      type: Object as PropType<IDesignViewOptions>,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('design-content');

    const rootRef = ref<HTMLDivElement | null>(null);
    const highlighter = ref<DesignItemHighlighterBinding | null>(null);

    const c = useDesignViewController();

    /**
     * 根据配置计算界面样式
     */
    const style = computed(() => {
      if (c.store.pageNode) {
        return calcStyle(c.store.pageNode.data);
      }
      return {};
    });

    /**
     * 界面级跟组件，指定后会在绘制第一层之上包一层
     */
    const rootCom = computed<string>(() => {
      if (c.store.pageNode) {
        const p = NodeRegister.get(c.store.pageNode.type, c.store.prefix);
        if (p) {
          return p.component;
        }
      }
      return '';
    });

    /**
     * 获取子节点
     *
     * @param {IDesignNode} item
     * @returns {*}  {IDesignNode[]}
     */
    function getChildren(item: IDesignNode): IDesignNode[] {
      return item.type === DesignNodeType.PAGE
        ? c.store.getChildren()
        : c.store.getChildren(item.id);
    }

    /**
     * 绘制可拖拽项
     *
     * @param index
     * @param node
     * @param parent
     * @returns
     */
    const renderDragItem = (index: number, node: IDesignNode, parent: IDesignNode) => {
      const provider = NodeRegister.get(node.type, c.store.prefix);
      if (!provider) {
        return <design-not-found message={`未找到节点类型：${node.type}`} />;
      }
      if (provider.isDrag === false) {
        return (
          <DesignNotDragItem
            key={node.id}
            direction="horizontal"
            group={parent.id}
            parent={parent}
            index={index}
            data={node}
          >
            {renderItem(node, parent)}
          </DesignNotDragItem>
        );
      }
      return (
        <DesignDragItem
          key={node.id}
          direction="horizontal"
          group={parent.id}
          parent={parent}
          index={index}
          data={node}
        >
          {renderItem(node, parent)}
        </DesignDragItem>
      );
    };

    /**
     * 绘制拖拽项
     *
     * @param provider
     * @param node
     * @param children
     * @returns
     */
    const renderItems = (provider: INodeProvider, node: IDesignNode, children: IDesignNode[]) => {
      const content: any[] = [];
      children.forEach((item, i) => {
        if (provider) {
          if (provider.isDrop) {
            content.push(
              <DesignDropLine
                key={`after_drop_line_${item.id}`}
                group={item.id}
                index={i}
                item={item}
                parent={node}
                beforeItem={children[i - 1]}
                direction={provider.direction ?? 'horizontal'}
              />,
            );
          }
          content.push(renderDragItem(i, item, node));
          if (provider.isDrop && children.length === i + 1) {
            content.push(
              <DesignDropLine
                key={`after_drop_line_${item.id}`}
                group={item.id}
                index={i}
                item={item}
                parent={node}
                beforeItem={children[i - 1]}
                direction={provider.direction ?? 'horizontal'}
                isBefore={false}
              />,
            );
          }
        }
      });
      return content;
    };

    /**
     * 绘制拖拽容器
     *
     * @param node
     * @param children
     * @param parent
     * @returns
     */
    const renderContainer = (
      node: IDesignNode,
      children: IDesignNode[] = getChildren(node),
      parent?: IDesignNode,
    ): VNode => {
      const provider = NodeRegister.get(node.type, c.store.prefix);
      if (!provider) {
        return <design-not-found message={`未找到节点类型：${node.type}`} />;
      }
      return (
        <design-drop-container
          key={node.id}
          node={node}
          items={children}
          parent={parent}
          direction={provider.direction ?? 'horizontal'}
        >
          {renderItems(provider, node, children)}
        </design-drop-container>
      );
    };

    /**
     * 绘制组件项
     *
     * @param item 当前项数据
     * @param parent 父级项数据
     * @returns
     */
    const renderItem = (item: IDesignNode, parent?: IDesignNode) => {
      const provider = NodeRegister.get(item.type, c.store.prefix);
      if (!provider) {
        return <design-not-found message={`未找到节点类型：${item.type}`} />;
      }
      if (provider.mode === DesignNodeMode.CONTAINER) {
        const items = getChildren(item);
        return h(
          resolveComponent(provider.component) as any,
          { key: item.id, count: c.store.count, data: item, parent, children: items },
          {
            default: (data: {
              node?: IDesignNode;
              children?: IDesignNode[];
              parent?: IDesignNode;
            }) => {
              // 特殊指定父，根据父取绘制
              if (data && data.node) {
                return renderContainer(data.node, data.children ?? items, data.parent ?? item);
              }
              // 未指定父，根据当前项取绘制
              return renderContainer(item, items, parent);
            },
            item: (data: { index: number; node: IDesignNode; parent?: IDesignNode }) => {
              return renderDragItem(data.index, data.node, data.parent ?? item);
            },
          },
        );
      }
      return h(resolveComponent(provider.component), {
        key: item.id,
        count: c.store.count,
        data: item,
        parent,
      });
    };

    const renderPage = () => {
      const item = c.store.pageNode!;
      const items = getChildren(item);
      return h(resolveComponent(rootCom.value), { count: c.store.count, node: c.store.pageNode }, {
        default: (data: { node?: IDesignNode; children?: IDesignNode[]; parent?: IDesignNode }) => {
          // 特殊指定父，根据父取绘制
          if (data && data.node) {
            return renderContainer(data.node, data.children ?? items, data.parent ?? item);
          }
          // 未指定父，根据当前项取绘制
          return renderContainer(item, items);
        },
        item: (data: { index: number; node: IDesignNode; parent?: IDesignNode }) => {
          return renderDragItem(data.index, data.node, data.parent ?? item);
        },
      } as any);
    };

    const onMouseHover = (e: MouseEvent) => {
      if (!highlighter.value) {
        return;
      }
      const pathList = e.composedPath().filter((_) => {
        if (_ instanceof HTMLElement) {
          const el = _ as HTMLElement;
          const canDrop = el.getAttribute(DesignItemAttribute.ACTIVE_TAG);
          return canDrop == 'true';
        }
        return false;
      });
      if (pathList.length && pathList.length > 0) {
        const el = pathList[0] as HTMLElement;
        highlighter.value.setHover(el);
      } else {
        if (highlighter.value.isHover) {
          highlighter.value.setHover();
        }
      }
    };

    const onMouseenter = (e: MouseEvent) => {
      onMouseHover(e);
    };

    const onMouseleave = (e: MouseEvent) => {
      onMouseHover(e);
    };

    onMounted(() => {
      rootRef.value!.addEventListener('mouseenter', onMouseenter, { capture: true });
      rootRef.value!.addEventListener('mouseleave', onMouseleave, { capture: true });
      rootRef.value!.addEventListener('mouseover', onMouseenter, { capture: true });
      rootRef.value!.addEventListener('mouseout', onMouseleave, { capture: true });
    });

    onBeforeUnmount(() => {
      rootRef.value!.removeEventListener('mouseenter', onMouseenter, { capture: true });
      rootRef.value!.removeEventListener('mouseleave', onMouseleave, { capture: true });
      rootRef.value!.removeEventListener('mouseover', onMouseenter, { capture: true });
      rootRef.value!.removeEventListener('mouseout', onMouseleave, { capture: true });
    });

    const calcHighlighter = () => {
      if (highlighter.value) {
        if (c.store.selected) {
          const el = rootRef.value!.querySelector(
            `[${DesignItemAttribute.NODE_ID_TAG}="${c.store.selected.id}"]`,
          );
          highlighter.value.setSelect(el as HTMLElement);
        } else {
          highlighter.value.setSelect();
        }
      }
    };

    watch(
      () => [c.store.selected, c.store.map.size],
      () => {
        calcHighlighter();
      },
    );

    watch(
      () => c.store.count,
      () => {
        nextTick(() => {
          calcHighlighter();
        });
      },
    );

    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      c.store.activePage();
    };

    return {
      ns,
      rootRef,
      highlighter,
      style,
      rootCom,
      c,
      onClick,
      renderContainer,
      renderItem,
      renderPage,
    };
  },
  render() {
    const content = this.renderContainer(this.c.store.pageNode!);
    content.props!.style = this.style;
    const container = this.$slots.container;
    const child = this.rootCom ? this.renderPage() : content;
    return (
      <div ref="rootRef" class={[this.ns.b()]} onClick={this.onClick}>
        <DesignItemHighlighter ref="highlighter" />
        {!container ? (
          <MobileContainer
            headerBgColor={this.c.store.pageNode?.data.headerBgColor}
            showTitleBar={this.opts.showMobileTitleBar}
          >
            {child}
          </MobileContainer>
        ) : (
          container(child)
        )}
      </div>
    );
  },
});

export default DesignContent;
