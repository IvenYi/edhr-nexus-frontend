import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import './material-tab-pane.scss';

export const MaterialTabPane = defineComponent({
  name: 'MaterialTabPane',
  props: {
    tabTag: {
      type: String,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('material-tab-pane');
    return { ns };
  },
  render() {
    return <div class={this.ns.b()}>{this.$slots.default?.()}</div>;
  },
});
