import { defineComponent, PropType } from 'vue';
import { useNamespace, useGctFormValue, INumberEditor, EditorController } from '@gct/runtime';

export const GctFormNumber = defineComponent({
  name: 'GctFormNumber',
  props: {
    model: {
      type: Object as PropType<INumberEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('gct-form-number');

    const c = new EditorController(props.model);

    const val = useGctFormValue();

    return { ns, c, val };
  },
  render() {
    return (
      <a-input-number
        v-model:value={this.val}
        {...(this.model.props || {})}
        class={[this.ns.b(), this.model.class]}
        prefix={this.model.prefix}
        suffix={this.model.suffix}
        addonBefore={this.model.addonBefore}
        addonAfter={this.model.addonAfter}
        placeholder={this.model.placeholder}
        max={this.model.max}
        min={this.model.min}
        precision={this.model.precision}
      />
    );
  },
});
