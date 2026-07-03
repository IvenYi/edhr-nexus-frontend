import {
  defineComponent,
  onMounted,
  provide,
  reactive,
  ref,
  resolveComponent,
  h,
  PropType,
  watch,
} from 'vue';
import { useNamespace } from '@gct/runtime';
import { DiagramConfigItemContainer } from './components';
import { RelationshipDiagramConfigController } from './relationship-diagram-config.controller';
import { ControllerTag, NodeType } from './constant';
import { RegisterUtil } from './utils';
import { IRelationshipDiagramNode, IRelationshipDiagramOptions } from './interface';
import { uuid } from '@jsplumb/browser-ui';
import { cloneDeep } from 'lodash-es';
import './relationship-diagram-config.scss';

/**
 * 关系图配置
 */
export const RelationshipDiagramConfig = defineComponent({
  name: 'RelationshipDiagramConfig',
  components: {
    DiagramConfigItemContainer,
  },
  props: {
    context: {
      type: Object as PropType<IData>,
      default: () => {
        return {};
      },
    },
    items: {
      type: Array<IRelationshipDiagramNode>,
      default: () => [],
    },
    config: {
      type: Object as PropType<IRelationshipDiagramOptions>,
    },
  },
  emits: ['update:items'],
  setup(props, { emit }) {
    const ns = useNamespace('relationship-diagram-config');

    const elRef = ref<HTMLDivElement>();

    const lastId = uuid();

    const { fieldModelKey } = props.context;

    const c = new RelationshipDiagramConfigController();
    c.state = reactive(c.state);

    if (props.config) {
      Object.assign(c.config, props.config);
    }

    provide(ControllerTag.ROOT, c);

    watch(
      () => props.items,
      () => {
        if (JSON.stringify(props.items) !== JSON.stringify(c.state.nodes)) {
          c.clearAll();
          if (props.items && props.items.length > 0) {
            c.node.setNodes(cloneDeep(props.items));
          }
        }
      },
      {
        immediate: true,
      },
    );

    watch(
      () => c.state.nodes,
      () => {
        emit('update:items', cloneDeep(c.state.nodes));
      },
      {
        deep: true,
      },
    );

    // 是否为结束节点
    const isEnd = (item: IRelationshipDiagramNode, i: number) => {
      return (
        // 节点和跟为同一个结束
        item.modelKey === fieldModelKey ||
        // 是最大节点，结束
        (c.config.max && c.config.max === i + 1) ||
        // 最后一个是反转节点为结束，不会再出现后续虚拟节点等
        item.reverse === true
      );
    };

    onMounted(() => {
      c.initPlumb(elRef.value!);
      c.connectAll();
    });

    return { ns, elRef, c, lastId, isEnd };
  },
  render() {
    const lastNode = this.c.state.nodes[this.c.state.nodes.length - 1];
    const lastIndex = this.c.state.nodes.length - 1;
    const endProvider = RegisterUtil.getNode(NodeType.VIRTUAL);
    return (
      <div ref="elRef" class={this.ns.b()}>
        {this.c.state.nodes.map((node, i) => {
          const provider = RegisterUtil.getNode(node.type || NodeType.DEFAULT);
          return (
            <DiagramConfigItemContainer
              key={node.id}
              i={i}
              id={node.id}
              onMounted={() => this.c.node.mounted(node.id)}
              onUnmounted={() => this.c.node.unmounted(node.id)}
            >
              {provider
                ? h(resolveComponent(provider.component), {
                    key: node.id,
                    context: this.context,
                    i,
                    data: node,
                    isEnd: this.isEnd(node, i),
                  })
                : `为找到节点适配器类型：${node.type}`}
            </DiagramConfigItemContainer>
          );
        })}
        {this.isEnd(lastNode, lastIndex) ? null : (
          <DiagramConfigItemContainer key={lastNode.id} i={lastIndex + 1} id={this.lastId}>
            {endProvider
              ? h(resolveComponent(endProvider.component), {
                  beforeNodeId: lastNode.id,
                  i: lastIndex + 1,
                  id: this.lastId,
                })
              : `为找到虚拟节点适配器`}
          </DiagramConfigItemContainer>
        )}
      </div>
    );
  },
});
