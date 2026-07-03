import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { containerNodeProps as props } from '@gct/runtime-render';
import './render-grid-item.scss';

export const MobileRenderGridItem = defineComponent({
  name: 'MobileRenderGridItem',
  props,
  setup(defProps) {
    const ns = useNamespace('mobile-render-grid-item');

    const v = defProps.model.data;

    return { ns, v };
  },
  render() {
    return <div class={this.ns.b()}>{{ default: this.$slots.default }}</div>;
  },
});
