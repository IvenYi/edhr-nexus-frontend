import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import './shrink-panel.scss';

export const ShrinkPanel = defineComponent({
  name: 'ShrinkPanel',
  props: {
    title: {
      type: String,
      default: '',
    },
    // 收起后的后缀
    retractedSuffix: {
      type: String,
    }
  },
  setup() {
    const ns = useNamespace('shrink-panel');
    const isExpand = ref<boolean>(true);

    const toggleExpand = () => {
      isExpand.value = !isExpand.value;
    };

    return { ns, isExpand, toggleExpand };
  },
  render() {
    return <div class={[this.ns.b(), this.ns.is('not-expand', !this.isExpand)]}>
      <div class={this.ns.e('column')}>
        <div class={this.ns.e('column-icon')} onClick={this.toggleExpand}><i class="iconfont icon-AlignLeft" /></div>
        <div class={this.ns.e('column-title')}>{this.title}{this.retractedSuffix ? this.retractedSuffix : ''}</div>
      </div>
      <div class={this.ns.e('header')}>
        <div class={this.ns.e('title')}>{this.title}</div>
        <div class={this.ns.e('icon')} onClick={this.toggleExpand}>
          <i class="iconfont icon-AlignLeft" />
        </div>
      </div>
      <div class={this.ns.e('body')}>
        {this.$slots.default?.()}
      </div>
    </div>;
  },
});
