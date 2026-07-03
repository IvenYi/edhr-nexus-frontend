import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { LayoutContainer } from '/@page-designer/types/web';
import { toRefs } from '@vueuse/core';
import './layout-container-design2.scss';

export const LayoutContainerDesign2 = defineComponent({
  name: 'LayoutContainerDesign2',
  props: {
    widget: {
      type: Object as PropType<LayoutContainer>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('layout-container-design2');
    const { margin, textAlign } = toRefs(props.widget.props);
    return { ns, margin, textAlign };
  },
  render() {
    return this.$slots.default?.({
      parentWidget: this.widget,
      children: this.widget.children,
      props: {
        class: this.ns.b(),
        style: { '--layout-container-margin': `${this.margin}px`, 'text-align': this.textAlign },
      },
      itemProps: { direction: 'horizontal' },
    });
  },
});
