import { defineComponent } from 'vue';
import { useNamespace } from '@gct/runtime';
import './design-not-found.scss';

export const DesignNotFound = defineComponent({
  name: 'DesignNotFound',
  props: {
    message: {
      type: String,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('design-not-found');
    return { ns };
  },
  render() {
    return <div class={this.ns.b()}>{this.message}</div>;
  },
});

export default DesignNotFound;
