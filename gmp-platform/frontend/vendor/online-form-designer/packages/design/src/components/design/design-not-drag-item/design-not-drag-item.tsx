import { computed, defineComponent, PropType, toRefs } from 'vue';
import { useNamespace } from '@gct/runtime';
import { calcStyle, IDesignNode } from '@gct/base';
import { DesignItemAttribute } from '../../../constant';
import { useDesignViewController } from '../../../hooks';
import { NodeRegister } from '../../../register';
import { INodeProvider } from '../../../interface';
import './design-not-drag-item.scss';

export const DesignNotDragItem = defineComponent({
  name: 'DesignNotDragItem',
  props: {
    group: {
      type: String,
      required: true,
    },
    parent: {
      type: Object as PropType<IDesignNode>,
    },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    data: {
      type: Object as PropType<IDesignNode>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('design-not-drag-item');

    const c = useDesignViewController();

    const provider: INodeProvider = NodeRegister.get(props.data.type, c.store.prefix)!;

    const { data } = toRefs(props.data);

    const style = computed(() => {
      return calcStyle(data.value);
    });

    const onActive = (e: MouseEvent) => {
      e.stopPropagation();
      c.store.setActive(props.data);
    };

    return { ns, c, style, provider, onActive };
  },
  render() {
    return (
      <div
        id={this.data.id}
        {...{
          [DesignItemAttribute.NODE_ID_TAG]: this.data.id,
          [DesignItemAttribute.ACTIVE_TAG]: true,
          [DesignItemAttribute.DESIGN_NAME]: this.data.label,
          [DesignItemAttribute.DRAG_GROUP_TYPE]: this.provider.type,
          [DesignItemAttribute.GROUP_TAG]: this.group,
          [DesignItemAttribute.INDEX_TAG]: this.index,
          [DesignItemAttribute.SELECTOR_INDEX]: this.provider.selectorIndex ?? 0,
        }}
        class={this.ns.b()}
        style={this.style}
        onClick={this.onActive}
      >
        {this.$slots.default?.()}
      </div>
    );
  },
});
