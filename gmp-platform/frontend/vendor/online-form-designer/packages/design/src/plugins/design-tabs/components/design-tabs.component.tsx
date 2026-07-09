import { computed, defineComponent, nextTick, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { nodeContainerProps as props } from '../../../props';
import { useDesignViewController } from '../../../hooks';
import { IDesignTabsData } from '../design-tabs.data';
import './design-tabs.component.scss';

export const DesignTabsComponent = defineComponent({
  name: 'DesignTabsComponent',
  props,
  setup(defProps) {
    const ns = useNamespace('design-tabs-component');

    const c = useDesignViewController();

    const data = computed<IDesignTabsData>(() => {
      return defProps.data.data as IDesignTabsData;
    });

    const activeKey = ref<string>(data.value.defaultTab || '');

    const onChange = (key: string) => {
      nextTick(() => {
        c.store.setActive(c.store.getNode(key));
      });
    };

    return { ns, c, activeKey, onChange };
  },
  render() {
    const { tabType } = this.data.data;
    return (
      <div class={this.ns.b()}>
        <van-tabs
          class={[this.ns.is('center', this.data.data.center), this.ns.m(this.data.data.tabType)]}
          v-model:active={this.activeKey}
          shrink
          type={tabType === 'capsule' ? 'card' : 'line'}
          onChange={this.onChange}
          style={
            tabType === 'text' || tabType === 'capsule'
              ? null
              : { '--tab-gap': `${this.data.data.gutter}px` }
          }
          onClickTab={({ event }) => event.stopPropagation()}
        >
          {this.children.map((item, i) => {
            return (
              <van-tab key={item.id} name={item.id} title={item.label}>
                {this.$slots.item?.({ index: i, node: item, parent: this.data })}
              </van-tab>
            );
          })}
        </van-tabs>
      </div>
    );
  },
});
