import { defineComponent } from 'vue';
import { useNamespace, useFormValue, IEditorBasic } from '@gct/runtime';

export const FormText = defineComponent({
  name: 'FormText',
  props: {
    value: {
      type: String,
      default: '',
    },
    model: {
      type: Object as PropType<IEditorBasic>,
      required: true,
    },
  },
  emits: ['update:value'],
  setup() {
    const ns = useNamespace('form-text');

    const val = useFormValue();

    return { ns, val };
  },
  render() {
    return (
      <a-input
        v-model:value={this.val}
        class={this.ns.b()}
        placeholder={this.model.placeholder}
      ></a-input>
    );
  },
});
