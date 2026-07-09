import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IFormLine, IFormLineController } from '@gct/runtime';
import './gct-form-line.scss';

export const GctFormLine = defineComponent({
  name: 'GctFormLine',
  props: {
    c: {
      type: Object as PropType<IFormLineController>,
      required: true,
    },
    model: {
      type: Object as PropType<IFormLine>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('gct-form-line');

    const style = computed(() => {
      const { paddingTop, paddingBottom } = props.model;
      return {
        paddingTop,
        paddingBottom,
      };
    });

    return { ns, style };
  },
  render() {
    return (
      <div
        class={[this.ns.b(), this.ns.is('hidden', this.c.state.visible === false)]}
        style={this.style}
      >
        <div class={this.ns.e('line')}></div>
      </div>
    );
  },
});
