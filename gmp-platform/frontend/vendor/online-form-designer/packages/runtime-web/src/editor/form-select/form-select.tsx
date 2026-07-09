import { PropType, defineComponent } from 'vue';
import { IEditorBasic, useNamespace, useFormValue } from '@gct/runtime';

export const FormSelect = defineComponent({
  name: 'FormSelect',
  props: {
    value: {
      type: [String, Number, Boolean],
    },
    model: {
      type: Object as PropType<IEditorBasic>,
      required: true,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('form-select');
    if (!props.model.codeTag) {
      console.error('FormSelect 缺少 codeTag', props.model);
    }
    const options = gct.codeList.get(props.model.codeTag!);

    const val = useFormValue();

    return { ns, options, val };
  },
  render() {
    return (
      <a-select
        v-model:value={this.val}
        class={this.ns.b()}
        options={this.options}
        allowClear
        placeholder={this.model.placeholder}
      />
    );
  },
});

export default FormSelect;
