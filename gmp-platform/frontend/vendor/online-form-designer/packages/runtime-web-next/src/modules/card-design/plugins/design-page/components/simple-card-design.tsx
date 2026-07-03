import { computed, defineComponent, PropType, toRefs } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IDesignContainerNode } from '@gct/base';
import { DesignNodeType, useDesignViewController } from '@gct/runtime-design';
import { CARD_MODE } from '../../../enum';
import { ICardDesignPageNodeData } from '../../../interface';
import { useCardViewStore } from '../../../store';
import './simple-card-design.scss';

export const SimpleCardDesign = defineComponent({
  name: 'SimpleCardDesign',
  props: {
    count: {
      type: Number,
      default: 0,
    },
    node: {
      type: Object as PropType<IDesignContainerNode<ICardDesignPageNodeData>>,
      required: true,
    },
  },
  setup(props, { slots }) {
    // const t = window.$t;
    const ns = useNamespace('simple-card-design');
    const { node } = toRefs(props);

    const store = useCardViewStore();
    const c = useDesignViewController();

    const parentKey = computed<string | undefined>(() => {
      if (
        !node.value ||
        node.value.type === DesignNodeType.PAGE ||
        node.value.type === DesignNodeType.PAGE_LOWER
      ) {
        return undefined;
      }
      return node.value.id;
    });

    const nodes = computed(() => {
      return c.store.getChildren(parentKey.value);
    });

    const style = computed(() => {
      const { data } = node.value;
      const style: IObject = {};
      if (node.value) {
        style.width = `${data.width}px`;
        style.backgroundColor = data.background;
        style.borderRadius = `${data.border_radius}px`;
        const padding = data.spacing?.[1];
        if (padding) {
          style.paddingTop = padding.top;
          style.paddingRight = padding.right;
          style.paddingBottom = padding.bottom;
          style.paddingLeft = padding.left;
        }
      }
      return style;
    });

    return () => {
      const { data } = node.value;
      return (
        <div
          class={[ns.b(), ns.is('simple', store.json.mode === CARD_MODE.SIMPLE)]}
          style={style.value}
        >
          <a-row gutter={[12, 8]} wrap>
            {nodes.value.length > 0
              ? nodes.value.map((node, index) => {
                  return <a-col span={data.colspan || 24}>{slots.item?.({ index, node })}</a-col>;
                })
              : null}
          </a-row>
        </div>
      );
    };
  },
});
