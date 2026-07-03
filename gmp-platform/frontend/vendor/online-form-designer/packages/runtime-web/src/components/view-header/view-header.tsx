import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';

export const ViewHeader = defineComponent({
  name: 'ViewHeader',
  props: {
    title: {
      type: String,
      default: '',
    },
    desc: {
      type: String,
      default: '',
    },
  },
  setup() {
    const ns = useNamespace('view-header');
    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('title')}>{this.title}</div>
        <div class={this.ns.e('desc')}>{this.desc}</div>
      </div>
    );
  },
});
