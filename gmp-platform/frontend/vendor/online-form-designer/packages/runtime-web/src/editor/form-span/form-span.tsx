import { defineComponent } from 'vue';
import { useNamespace, IEditorBasic } from '@gct/runtime';

export const FormSpan = defineComponent({
  name: 'FormSpan',
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
    const ns = useNamespace('form-span');

    return { ns };
  },
  render() {
    return <span class={this.ns.b()}>{this.$slots.default?.()}</span>;
  },
});
