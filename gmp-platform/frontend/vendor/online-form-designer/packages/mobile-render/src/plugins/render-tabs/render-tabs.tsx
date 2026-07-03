import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { containerNodeProps as props } from '@gct/runtime-render';
import './render-tabs.scss';

export const RenderTabs = defineComponent({
  name: 'MobileRenderTabs',
  props,
  setup(defProps) {
    const ns = useNamespace('mobile-render-tabs');

    const v = defProps.model.data;

    const activeTab = ref<string>(v.defaultTab);

    return { ns, v, activeTab };
  },
  render() {
    const slots = this.$slots.default?.() || [];
    return (
      <div class={this.ns.b()}>
        <van-tabs
          class={[this.ns.is('center', this.v.center), this.ns.m(this.v.tabType)]}
          v-model:active={this.activeTab}
          shrink
          type={this.v.tabType === 'capsule' ? 'card' : 'line'}
          style={
            this.v.tabType === 'text' || this.v.tabType === 'capsule'
              ? null
              : { '--tab-gap': `${this.v.gutter}px` }
          }
        >
          {slots.map((slot) => {
            const m = slot.props!.model;
            return (
              <van-tab title={m.data.title} name={m.id}>
                {{
                  default: () =>
                    this.v.selectDestroy == true && m.id !== this.activeTab ? null : slot,
                }}
              </van-tab>
            );
          })}
        </van-tabs>
      </div>
    );
  },
});
