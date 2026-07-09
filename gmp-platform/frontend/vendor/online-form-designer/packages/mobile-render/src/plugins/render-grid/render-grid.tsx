import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import { containerNodeProps as props } from '@gct/runtime-render';
import './render-grid.scss';

export const MobileRenderGrid = defineComponent({
  name: 'MobileRenderGrid',
  props,
  setup(defProps) {
    const ns = useNamespace('mobile-render-grid');

    const v = defProps.model.data;

    return { ns, v };
  },
  render() {
    const slots = this.$slots.default?.() || [];
    return (
      <van-row class={this.ns.b()} gutter={this.v.gutter}>
        {slots.map((slot) => {
          return (
            <van-col class={this.ns.e('col')} span={slot.props!.model.data.span}>
              {{ default: () => slot }}
            </van-col>
          );
        })}
      </van-row>
    );
  },
});
