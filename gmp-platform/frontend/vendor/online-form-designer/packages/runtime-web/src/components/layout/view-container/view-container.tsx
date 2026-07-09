import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import './view-container.scss';

export const ViewContainer = defineComponent({
  name: 'ViewContainer',
  props: {
    context: {
      type: Object,
    },
    params: {
      type: Object,
    },
    modal: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('view-container');

    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.$slots.header ? <div class={this.ns.b('header')}>{this.$slots.header()}</div> : null}
        <div class={this.ns.b('content')}>{this.$slots.default?.()}</div>
        {this.$slots.footer ? <div class={this.ns.b('footer')}>{this.$slots.footer()}</div> : null}
      </div>
    );
  },
});
