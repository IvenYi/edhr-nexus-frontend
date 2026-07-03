import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { nodeContainerProps as props } from '../../../props';
import { useDesignViewController } from '../../../hooks';
import './design-grid-item.component.scss';

export const DesignGridItemComponent = defineComponent({
  name: 'DesignGridItemComponent',
  props,
  setup() {
    const ns = useNamespace('design-grid-item-component');

    const c = useDesignViewController();

    return { ns, c };
  },
  render() {
    return <div class={this.ns.b()}>{this.$slots.default?.()}</div>;
  },
});
