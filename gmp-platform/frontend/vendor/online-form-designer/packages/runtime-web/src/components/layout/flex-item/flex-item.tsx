import { defineComponent, PropType } from 'vue';
import { useNamespace, IFlexItem } from '@gct/runtime';

/**
 * flex 布局容器项
 */
export const FlexItem = defineComponent({
  name: 'FlexItem',
  props: {
    layout: Object as PropType<IFlexItem>,
  },
  setup(props) {
    const ns = useNamespace('flex-item');

    const getStyle = () => {
      const style: IData = {};
      if (props.layout) {
        const { order, alignSelf, flexBasis, flexGrow, flexShrink } = props.layout;
        if (order != null) {
          style['order'] = order;
        }
        if (alignSelf != null) {
          style['align-self'] = alignSelf;
        }
        if (flexBasis != null) {
          style['flex-basis'] = flexBasis;
        }
        if (flexGrow != null) {
          style['flex-grow'] = flexGrow;
        }
        if (flexShrink != null) {
          style['flex-shrink'] = flexShrink;
        }
      }
      return style;
    };

    return { ns, getStyle };
  },
  render() {
    return (
      <div class={this.ns.b()} style={this.getStyle()}>
        {this.$slots.default?.()}
      </div>
    );
  },
});

export default FlexItem;
