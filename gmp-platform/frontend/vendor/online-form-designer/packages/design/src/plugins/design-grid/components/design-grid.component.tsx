import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { nodeContainerProps as props } from '../../../props';
import { useDesignViewController } from '../../../hooks';
import './design-grid.component.scss';

export const DesignGridComponent = defineComponent({
  name: 'DesignGridComponent',
  props,
  setup() {
    const ns = useNamespace('design-grid-component');

    const c = useDesignViewController();

    const activeKey = ref<string>(props.children[0]?.id || '');

    return { ns, c, activeKey };
  },
  render() {
    return (
      <a-row class={this.ns.b()} gutter={this.data.data.gutter}>
        {this.children.map((item, i) => {
          return (
            <a-col class={this.ns.e('col')} span={item.data.span}>
              {this.$slots.item?.({ index: i, node: item, parent: this.data })}
            </a-col>
          );
        })}
      </a-row>
    );
  },
});
