import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { containerNodeProps as props } from '@gct/runtime-render';
import './render-tab-item.scss';

export const RenderTabItem = defineComponent({
  name: 'MobileRenderTabItem',
  props,
  setup() {
    const ns = useNamespace('mobile-render-tab-item');
    return { ns };
  },
  render() {
    return <div class={this.ns.b()}>{{ default: this.$slots.default }}</div>;
  },
});
