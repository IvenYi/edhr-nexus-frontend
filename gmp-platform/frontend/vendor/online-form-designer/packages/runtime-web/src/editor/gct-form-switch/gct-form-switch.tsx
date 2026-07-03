import { defineComponent, PropType } from 'vue';
import { useGctFormValue, useNamespace, ISwitchEditor } from '@gct/runtime';
// import './gct-form-switch.scss';

export const GctFormSwitch = defineComponent({
  name: 'GctFormSwitch',
  props: {
    model: {
      type: Object as PropType<ISwitchEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    size: {
      type: String,
    }
  },
  setup() {
    const ns = useNamespace('gct-form-switch');

    const val = useGctFormValue();

    return { ns, val };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <a-switch v-model:checked={this.val} size={this.size} {...(this.model.props || {})} />
      </div>
    );
  },
});
