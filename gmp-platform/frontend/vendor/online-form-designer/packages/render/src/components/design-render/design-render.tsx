import { defineComponent, PropType, h, resolveComponent, watch, computed } from 'vue';
import { calcStyle, DesignNodeMode, IDesignData, IDesignNode } from '@gct/base';
import { useNamespace } from '@gct/runtime';
import { useDesignRenderController } from '../../hooks';
import { RenderNodeRegister } from '../../register';
import { DesignRenderItem } from '../design-render-item/design-render-item';
import './design-render.scss';

export const DesignRender = defineComponent({
  name: 'DesignRender',
  props: {
    model: {
      type: Object as PropType<IDesignData>,
      required: true,
    },
    prefix: {
      type: String,
      default: '',
    },
    preview: {
      type: Boolean,
      default: false,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const ns = useNamespace('design-render');

    const c = useDesignRenderController();
    c.prefix = props.prefix;
    c.preview = props.preview;
    c.setNodes(props.model.nodes);
    c.setTree(props.model.tree);

    watch(
      () => props.context,
      () => {
        c.state.context = props.context;
      },
      {
        immediate: true,
      },
    );

    const style = computed(() => {
      if (props.model.pageNode) {
        return calcStyle(props.model.pageNode.data);
      }
      return {};
    });

    const rootNodes = c.getNodes();

    function renderNodeItem(node: IDesignNode, parent?: IDesignNode) {
      const provider = RenderNodeRegister.get(node.type, c.prefix)!;
      const itemC = c.getController(node.id);
      return h(resolveComponent(provider.component), {
        key: node.id,
        c: itemC,
        model: node,
        parent,
        preview: props.preview,
        context: c.state.context,
        pageModel: props.model.pageNode,
      });
    }

    function renderNodeContainer(node: IDesignNode, parent?: IDesignNode) {
      const provider = RenderNodeRegister.get(node.type, c.prefix)!;
      const items = c.getNodes(node.id);
      const itemC = c.getController(node.id);
      return h(
        resolveComponent(provider.component),
        {
          key: node.id,
          c: itemC,
          model: node,
          parent,
          preview: props.preview,
          context: c.state.context,
          pageModel: props.model.pageNode,
        },
        items.map((_) => {
          return renderNode(_, node);
        }),
      );
    }

    function renderNode(node: IDesignNode, parent?: IDesignNode) {
      const provider = RenderNodeRegister.get(node.type, c.prefix);
      if (!provider) {
        console.warn(`未找到节点类型为${node.type}的渲染器`);
        return null;
      }
      let content: any = null;
      if (provider.mode === DesignNodeMode.CONTAINER) {
        content = renderNodeContainer(node, parent);
      } else if (provider.mode === DesignNodeMode.ITEM) {
        content = renderNodeItem(node, parent);
      } else {
        content = <div>未支持的适配器模式[{provider.mode}]</div>;
      }
      return <DesignRenderItem model={node}>{{ default: () => content }}</DesignRenderItem>;
    }

    function renderPageNode(child: any[]) {
      if (!props.model.pageNode) {
        return child;
      }
      const provider = RenderNodeRegister.get(props.model.pageNode.type, c.prefix)!;
      if (!provider) {
        console.warn(`未找到页面节点类型为${props.model.pageNode.type}的渲染器`);
        return child;
      }
      const itemC = c.getController(props.model.pageNode.id);
      return h(
        resolveComponent(provider.component),
        {
          key: props.model.pageNode.id,
          c: itemC,
          model: props.model.pageNode,
          parent: undefined,
          preview: props.preview,
          context: c.state.context,
        },
        child,
      );
    }

    return { ns, c, style, rootNodes, renderNode, renderPageNode };
  },
  render() {
    return (
      <div class={this.ns.b()} style={this.style}>
        {this.renderPageNode(
          this.rootNodes.map((node) => {
            return this.renderNode(node);
          }),
        )}
      </div>
    );
  },
});
