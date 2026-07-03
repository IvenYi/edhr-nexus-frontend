import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { nodeContainerProps as props } from '../../../props';
import { useDesignViewController } from '../../../hooks';
import './design-tab-item.component.scss';

export const DesignTabItemComponent = defineComponent({
  name: 'DesignTabItemComponent',
  props,
  setup() {
    const ns = useNamespace('design-tab-item-component');

    const c = useDesignViewController();

    return { ns, c };
  },
  render() {
    return <div class={this.ns.b()}>{this.$slots.default?.()}</div>;
  },
});
