import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { calcStyle, IDesignNode } from '@gct/base';
import './design-render-item.scss';

export const DesignRenderItem = defineComponent({
  name: 'DesignRenderItem',
  props: {
    model: {
      type: Object as PropType<IDesignNode>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('design-render-item');

    const style = calcStyle(props.model.data);

    return { ns, style };
  },
  render() {
    return (
      <div class={this.ns.b()} style={this.style}>
        {this.$slots.default?.()}
      </div>
    );
  },
});
